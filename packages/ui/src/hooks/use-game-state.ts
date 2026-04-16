import {
	CHANNEL_NAME,
	clampScore,
	clampSet,
	computeServing,
	DEFAULT_GAME_STATE,
	type GameState,
	type SetRecord,
	STORAGE_KEY,
} from "@workspace/ui/lib/game-state";
import { useCallback, useEffect, useRef, useState } from "react";

type Role = "control" | "display";

function loadState(): GameState {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			return {
				...DEFAULT_GAME_STATE,
				...parsed,
				hotkeys: {
					...DEFAULT_GAME_STATE.hotkeys,
					...(parsed.hotkeys || {}),
				},
			};
		}
	} catch {
		// ignore
	}
	return { ...DEFAULT_GAME_STATE };
}

function saveState(state: GameState): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// ignore
	}
}

/** Apply auto-serve logic after a score change */
function applyAutoServe(state: GameState): GameState {
	const totalPoints = state.teamA.score + state.teamB.score;
	// We need to know the "initial server" for this set.
	// We track who was serving at 0-0 by looking at who serves when totalPoints=0.
	// Since serving field is auto-computed, we store the initial server implicitly.
	// The initial server is whoever served at score 0-0, which we preserve across
	// score changes. We recompute serving from the initial server stored when set started.
	const newServing = computeServing(
		totalPoints,
		state.serveInterval,
		state._initialServer ?? state.serving,
		state.autoServeSwitch,
	);
	return { ...state, serving: newServing };
}

export function useGameState(role: Role) {
	const [state, setState] = useState<GameState>(loadState);
	const channelRef = useRef<BroadcastChannel | null>(null);

	// Initialize BroadcastChannel
	useEffect(() => {
		try {
			const channel = new BroadcastChannel(CHANNEL_NAME);
			channelRef.current = channel;

			channel.onmessage = (event: MessageEvent<GameState>) => {
				setState(event.data);
			};

			return () => {
				channel.close();
				channelRef.current = null;
			};
		} catch {
			// BroadcastChannel not supported, fall back to storage events
		}
	}, []);

	// Fallback: listen for storage events (for display page)
	useEffect(() => {
		if (role === "display") {
			const handleStorage = (e: StorageEvent) => {
				if (e.key === STORAGE_KEY && e.newValue) {
					try {
						setState(JSON.parse(e.newValue));
					} catch {
						// ignore
					}
				}
			};
			window.addEventListener("storage", handleStorage);
			return () => window.removeEventListener("storage", handleStorage);
		}
	}, [role]);

	// Broadcast + persist state changes (control only)
	const broadcast = useCallback(
		(newState: GameState) => {
			if (role === "control") {
				saveState(newState);
				try {
					channelRef.current?.postMessage(newState);
				} catch {
					// ignore
				}
			}
			setState(newState);
		},
		[role],
	);

	const incrementScore = useCallback(
		(team: "A" | "B") => {
			setState((prev) => {
				const key = team === "A" ? "teamA" : "teamB";
				let updated: GameState = {
					...prev,
					[key]: { ...prev[key], score: prev[key].score + 1 },
					nextSetCountdown: null, // Any manual action cancels previous countdown
				};
				updated = applyAutoServe(updated);

				// Check win conditions
				const scoreA = updated.teamA.score;
				const scoreB = updated.teamB.score;
				const isTargetReached =
					scoreA >= updated.targetScore || scoreB >= updated.targetScore;
				const isWinByTwoMet =
					!updated.winByTwo || Math.abs(scoreA - scoreB) >= 2;

				if (isTargetReached && isWinByTwoMet && updated.autoNextSet) {
					updated.nextSetCountdown = updated.autoNextSetDelay;
				}

				broadcast(updated);
				return updated;
			});
		},
		[broadcast],
	);

	const decrementScore = useCallback(
		(team: "A" | "B") => {
			setState((prev) => {
				const key = team === "A" ? "teamA" : "teamB";
				let updated: GameState = {
					...prev,
					[key]: { ...prev[key], score: clampScore(prev[key].score - 1) },
					nextSetCountdown: null, // Cancel countdown on decrement
				};
				updated = applyAutoServe(updated);
				broadcast(updated);
				return updated;
			});
		},
		[broadcast],
	);

	const setTeamName = useCallback(
		(team: "A" | "B", name: string) => {
			setState((prev) => {
				const key = team === "A" ? "teamA" : "teamB";
				const next = { ...prev, [key]: { ...prev[key], name } };
				broadcast(next);
				return next;
			});
		},
		[broadcast],
	);

	const toggleServing = useCallback(() => {
		setState((prev) => {
			// Manual toggle also changes the initial server
			const newServing = prev.serving === "A" ? "B" : "A";
			const next: GameState = {
				...prev,
				serving: newServing,
				_initialServer: newServing,
			};
			broadcast(next);
			return next;
		});
	}, [broadcast]);

	const swapSides = useCallback(() => {
		setState((prev) => {
			const next = { ...prev, swapped: !prev.swapped };
			broadcast(next);
			return next;
		});
	}, [broadcast]);

	const setCurrentSet = useCallback(
		(delta: number) => {
			setState((prev) => {
				const next = { ...prev, currentSet: clampSet(prev.currentSet + delta) };
				broadcast(next);
				return next;
			});
		},
		[broadcast],
	);

	const saveSetAndNext = useCallback(() => {
		setState((prev) => {
			const record: SetRecord = {
				setNumber: prev.currentSet,
				teamA: prev.teamA.score,
				teamB: prev.teamB.score,
			};
			const next: GameState = {
				...prev,
				setHistory: [...prev.setHistory, record],
				teamA: { ...prev.teamA, score: 0 },
				teamB: { ...prev.teamB, score: 0 },
				currentSet: clampSet(prev.currentSet + 1),
				_initialServer: prev.serving, // preserve who serves first in new set
				nextSetCountdown: null, // Reset countdown
			};
			broadcast(next);
			return next;
		});
	}, [broadcast]);

	const updateSettings = useCallback(
		(settings: Partial<GameState>) => {
			setState((prev) => {
				let updated = { ...prev, ...settings };
				// If serve interval/switch changes, reapply auto-serve logic right away
				if (
					settings.serveInterval !== undefined ||
					settings.autoServeSwitch !== undefined
				) {
					updated = applyAutoServe(updated);
				}
				broadcast(updated);
				return updated;
			});
		},
		[broadcast],
	);

	const importState = useCallback(
		(imported: Partial<GameState>) => {
			setState(() => {
				const next: GameState = {
					...DEFAULT_GAME_STATE,
					...imported,
					hotkeys: {
						...DEFAULT_GAME_STATE.hotkeys,
						...(imported.hotkeys || {}),
					},
				};
				broadcast(next);
				return next;
			});
		},
		[broadcast],
	);

	const resetAll = useCallback(() => {
		const next: GameState = {
			...DEFAULT_GAME_STATE,
			hotkeys: state.hotkeys,
			serveInterval: state.serveInterval,
			autoServeSwitch: state.autoServeSwitch,
			targetScore: state.targetScore,
			winByTwo: state.winByTwo,
			autoNextSet: state.autoNextSet,
			autoNextSetDelay: state.autoNextSetDelay,
		};
		broadcast(next);
	}, [
		broadcast,
		state.hotkeys,
		state.serveInterval,
		state.autoServeSwitch,
		state.targetScore,
		state.winByTwo,
		state.autoNextSet,
		state.autoNextSetDelay,
	]);

	return {
		state,
		incrementScore,
		decrementScore,
		setTeamName,
		toggleServing,
		swapSides,
		setCurrentSet,
		saveSetAndNext,
		updateSettings,
		importState,
		resetAll,
	};
}
