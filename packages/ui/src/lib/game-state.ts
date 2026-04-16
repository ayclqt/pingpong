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
	saveSetAndNext: string;
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
	autoServeSwitch: boolean;
	targetScore: number;
	winByTwo: boolean;
	autoNextSet: boolean;
	autoNextSetDelay: number;
	nextSetCountdown: number | null;
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
	saveSetAndNext: "ctrl+s",
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
	autoServeSwitch: true,
	targetScore: 11,
	winByTwo: true,
	autoNextSet: false,
	autoNextSetDelay: 5,
	nextSetCountdown: null,
};

export const CHANNEL_NAME = "pingpong-scoreboard";
export const STORAGE_KEY = "pingpong-state";

export function clampScore(score: number): number {
	return Math.max(0, score);
}

export function clampSet(set: number): number {
	return Math.max(1, Math.min(9, set));
}

export function getHotkeyLabel(key?: string): string {
	if (!key) return "";
	if (key === " ") return "Space";
	return key
		.split("+")
		.map((k) => k.charAt(0).toUpperCase() + k.slice(1))
		.join(" + ");
}

export function getEventKeyCombo(
	e: KeyboardEvent | React.KeyboardEvent,
): string {
	const keys = [];
	if (e.ctrlKey) keys.push("ctrl");
	if (e.metaKey) keys.push("meta");
	if (e.altKey) keys.push("alt");
	if (e.shiftKey) keys.push("shift");

	const key = e.key.toLowerCase();
	if (!["control", "shift", "alt", "meta"].includes(key)) {
		keys.push(key === " " ? " " : key);
	}

	return keys.join("+");
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
	autoServeSwitch: boolean,
): "A" | "B" {
	if (!autoServeSwitch || serveInterval <= 0) return initialServer;
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

export function exportSetHistoryCSV(state: GameState): string {
	const headers = ["Set", state.teamA.name, state.teamB.name, "Winner"];
	const rows = state.setHistory.map((record) => {
		const winner =
			record.teamA > record.teamB
				? state.teamA.name
				: record.teamB > record.teamA
					? state.teamB.name
					: "Draw";
		return [record.setNumber, record.teamA, record.teamB, winner].join(",");
	});
	return [headers.join(","), ...rows].join("\n");
}

export function exportSetHistoryTXT(state: GameState): string {
	let output = `Ping Pong Match: ${state.teamA.name} vs ${state.teamB.name}\n`;
	output += `--------------------------------------------------\n`;
	state.setHistory.forEach((record) => {
		const result =
			record.teamA > record.teamB
				? `${state.teamA.name} Wins`
				: record.teamB > record.teamA
					? `${state.teamB.name} Wins`
					: "Draw";
		output += `Set ${record.setNumber}: ${state.teamA.name} ${record.teamA} - ${record.teamB} ${state.teamB.name} (${result})\n`;
	});
	output += `--------------------------------------------------\n`;
	const wins = countSetWins(state.setHistory);
	output += `Total Sets: ${state.teamA.name} ${wins.teamA} - ${wins.teamB} ${state.teamB.name}\n`;
	return output;
}
