import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
import type { HotkeyConfig } from "@workspace/ui/lib/game-state";
import { DEFAULT_HOTKEYS, getHotkeyLabel } from "@workspace/ui/lib/game-state";
import { useCallback, useState } from "react";

const HOTKEY_LABELS: Record<keyof HotkeyConfig, string> = {
	leftIncrement: "Bên trái +1 điểm",
	leftDecrement: "Bên trái -1 điểm",
	rightIncrement: "Bên phải +1 điểm",
	rightDecrement: "Bên phải -1 điểm",
	swapSides: "Đổi sân",
	toggleServing: "Đổi quyền giao bóng",
	setIncrement: "Set +1",
	setDecrement: "Set -1",
};

interface SettingsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	hotkeys: HotkeyConfig;
	onSave: (hotkeys: HotkeyConfig) => void;
}

export default function SettingsDialog({
	open,
	onOpenChange,
	hotkeys,
	onSave,
}: SettingsDialogProps) {
	const [draft, setDraft] = useState<HotkeyConfig>({ ...hotkeys });
	const [recording, setRecording] = useState<keyof HotkeyConfig | null>(null);

	const handleKeyCapture = useCallback(
		(e: React.KeyboardEvent) => {
			if (!recording) return;
			e.preventDefault();
			e.stopPropagation();

			const key = e.key.toLowerCase();
			// Ignore modifier keys by themselves
			if (["control", "shift", "alt", "meta"].includes(key)) return;

			setDraft((prev) => ({ ...prev, [recording]: key === " " ? " " : key }));
			setRecording(null);
		},
		[recording],
	);

	const handleSave = () => {
		onSave(draft);
		onOpenChange(false);
	};

	const handleReset = () => {
		setDraft({ ...DEFAULT_HOTKEYS });
	};

	// Sync draft when dialog opens
	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			setDraft({ ...hotkeys });
			setRecording(null);
		}
		onOpenChange(isOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md" onKeyDown={handleKeyCapture}>
				<DialogHeader>
					<DialogTitle>Cài đặt phím tắt</DialogTitle>
					<DialogDescription>
						Nhấn vào phím tắt muốn thay đổi, sau đó nhấn phím mới.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-3 py-4">
					{(Object.keys(HOTKEY_LABELS) as (keyof HotkeyConfig)[]).map((key) => (
						<div
							key={key}
							className="grid grid-cols-[1fr_auto] items-center gap-4"
						>
							<Label className="text-sm">{HOTKEY_LABELS[key]}</Label>
							<button
								type="button"
								onClick={() => setRecording(key)}
								className={`inline-flex h-8 min-w-12 items-center justify-center rounded-md border px-3 font-mono text-sm transition-all ${
									recording === key
										? "border-primary bg-primary/10 text-primary animate-pulse"
										: "border-border bg-muted text-foreground hover:bg-muted/80"
								}`}
							>
								{recording === key ? "..." : getHotkeyLabel(draft[key])}
							</button>
						</div>
					))}
				</div>

				<DialogFooter className="flex gap-2">
					<Button variant="outline" onClick={handleReset} type="button">
						Mặc định
					</Button>
					<Button onClick={handleSave} type="button">
						Lưu
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
