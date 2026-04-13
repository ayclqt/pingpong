export interface SetRecord {
	setNumber: number;
	teamA: number;
	teamB: number;
}

export interface HotkeyConfig {
	leftIncrement: string;
	leftDecrement: string;
	rightIncrement: string;
	rightDecrement: string;
	swapSides: string;
	toggleServing: string;
	setIncrement: string;
	setDecrement: string;
}

export interface GameState {
	teamA: { name: string; score: number };
	teamB: { name: string; score: number };
	serving: "A" | "B";
	/** Who served first this set (used by auto-serve logic) */
	_initialServer?: "A" | "B";
	currentSet: number;
	swapped: boolean;
	setHistory: SetRecord[];
	hotkeys: HotkeyConfig;
	serveInterval: number; // auto-switch serving every N total points
}

export const DEFAULT_HOTKEYS: HotkeyConfig = {
	leftIncrement: "q",
	leftDecrement: "a",
	rightIncrement: "p",
	rightDecrement: "l",
	swapSides: "s",
	toggleServing: " ",
	setIncrement: "]",
	setDecrement: "[",
};

export const DEFAULT_GAME_STATE: GameState = {
	teamA: { name: "Đội A", score: 0 },
	teamB: { name: "Đội B", score: 0 },
	serving: "A",
	currentSet: 1,
	swapped: false,
	setHistory: [],
	hotkeys: { ...DEFAULT_HOTKEYS },
	serveInterval: 2,
};

export const CHANNEL_NAME = "pingpong-scoreboard";
export const STORAGE_KEY = "pingpong-state";

export function clampScore(score: number): number {
	return Math.max(0, score);
}

export function clampSet(set: number): number {
	return Math.max(1, Math.min(9, set));
}

export function getHotkeyLabel(key: string): string {
	if (key === " ") return "Space";
	return key.toUpperCase();
}

/**
 * Determine who should be serving based on total points and serve interval.
 * In standard ping pong: serve switches every 2 points.
 * The first server is state.serving at score 0-0 (the "initial server").
 */
export function computeServing(
	totalPoints: number,
	serveInterval: number,
	initialServer: "A" | "B",
): "A" | "B" {
	if (serveInterval <= 0) return initialServer;
	const switches = Math.floor(totalPoints / serveInterval);
	return switches % 2 === 0 ? initialServer : initialServer === "A" ? "B" : "A";
}

/**
 * Count set wins for each team from set history.
 */
export function countSetWins(history: SetRecord[]): {
	teamA: number;
	teamB: number;
} {
	let teamA = 0;
	let teamB = 0;
	for (const record of history) {
		if (record.teamA > record.teamB) teamA++;
		else if (record.teamB > record.teamA) teamB++;
	}
	return { teamA, teamB };
}
