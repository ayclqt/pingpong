import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import type { GameState, HotkeyConfig } from "@workspace/ui/lib/game-state"
import {
  DEFAULT_HOTKEYS,
  getEventKeyCombo,
  getHotkeyLabel,
} from "@workspace/ui/lib/game-state"
import { useCallback, useEffect, useState } from "react"

const HOTKEY_LABELS: Record<keyof HotkeyConfig, string> = {
  leftIncrement: "Bên trái +1 điểm",
  leftDecrement: "Bên trái -1 điểm",
  rightIncrement: "Bên phải +1 điểm",
  rightDecrement: "Bên phải -1 điểm",
  swapSides: "Đổi sân",
  toggleServing: "Đổi quyền giao bóng",
  setIncrement: "Set +1",
  setDecrement: "Set -1",
  saveSetAndNext: "Lưu set & tiếp",
}

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  state: GameState
  updateSettings: (settings: Partial<GameState>) => void
}

export default function SettingsDialog({
  open,
  onOpenChange,
  state,
  updateSettings,
}: SettingsDialogProps) {
  const [draft, setDraft] = useState<Partial<GameState>>({})
  const [recording, setRecording] = useState<keyof HotkeyConfig | null>(null)

  const handleKeyCapture = useCallback(
    (e: React.KeyboardEvent) => {
      if (!recording) return
      e.preventDefault()
      e.stopPropagation()

      const key = e.key.toLowerCase()
      if (["control", "shift", "alt", "meta"].includes(key)) return

      const combo = getEventKeyCombo(e)

      setDraft((prev) => ({
        ...prev,
        hotkeys: { ...(prev.hotkeys || DEFAULT_HOTKEYS), [recording]: combo },
      }))
      setRecording(null)
    },
    [recording]
  )

  const handleSave = () => {
    updateSettings(draft)
    onOpenChange(false)
  }

  // Sync draft when dialog opens
  useEffect(() => {
    if (open) {
      setDraft({
        hotkeys: state.hotkeys,
        serveInterval: state.serveInterval,
        autoServeSwitch: state.autoServeSwitch,
        targetScore: state.targetScore,
        winByTwo: state.winByTwo,
        autoNextSet: state.autoNextSet,
        autoNextSetDelay: state.autoNextSetDelay,
      })
      setRecording(null)
    }
  }, [open, state])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyCapture}
      >
        <DialogHeader>
          <DialogTitle>Cài đặt trận đấu</DialogTitle>
          <DialogDescription>
            Cấu hình luật chơi bóng bàn, tự động hóa và phím tắt điều khiển.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          {/* Left Column: Match & Auto Settings */}
          <div className="flex flex-col gap-6">
            {/* Match Settings */}
            <div>
              <h3 className="text-md font-bold mb-4 pb-2 border-b">
                Luật thi đấu
              </h3>
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="targetScore" className="text-sm">
                    Tỷ số chung cuộc (Target)
                  </Label>
                  <Input
                    id="targetScore"
                    type="number"
                    min={1}
                    className="w-20 text-center"
                    value={draft.targetScore ?? 11}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        targetScore: parseInt(e.target.value, 10) || 11,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label
                    htmlFor="winByTwo"
                    className="text-sm cursor-pointer border-none font-medium text-foreground"
                  >
                    Chế độ Deuce (cách biệt 2 điểm mới thắng)
                  </Label>
                  <Switch
                    id="winByTwo"
                    checked={draft.winByTwo ?? true}
                    onCheckedChange={(checked) =>
                      setDraft((prev) => ({
                        ...prev,
                        winByTwo: checked,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="serveInterval" className="text-sm">
                    Đổi giao bóng sau (điểm)
                  </Label>
                  <Input
                    id="serveInterval"
                    type="number"
                    min={1}
                    className="w-20 text-center"
                    value={draft.serveInterval ?? 2}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        serveInterval: parseInt(e.target.value, 10) || 2,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label
                    htmlFor="autoServeSwitch"
                    className="text-sm cursor-pointer border-none font-medium text-foreground"
                  >
                    Tự động tính quyền giao bóng
                  </Label>
                  <Switch
                    id="autoServeSwitch"
                    checked={draft.autoServeSwitch ?? true}
                    onCheckedChange={(checked) =>
                      setDraft((prev) => ({
                        ...prev,
                        autoServeSwitch: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Automation Settings */}
            <div>
              <h3 className="text-md font-bold mb-4 pb-2 border-b">
                Tự động hoá
              </h3>
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-4">
                  <Label
                    htmlFor="autoNextSet"
                    className="text-sm cursor-pointer border-none font-medium text-foreground"
                  >
                    Tự động sang set mới khi thắng
                  </Label>
                  <Switch
                    id="autoNextSet"
                    checked={draft.autoNextSet ?? false}
                    onCheckedChange={(checked) =>
                      setDraft((prev) => ({
                        ...prev,
                        autoNextSet: checked,
                      }))
                    }
                  />
                </div>
                {(draft.autoNextSet ?? false) && (
                  <div className="flex items-center justify-between gap-4 ml-6">
                    <Label
                      htmlFor="autoNextSetDelay"
                      className="text-sm text-muted-foreground"
                    >
                      Thời gian chờ (giây)
                    </Label>
                    <Input
                      id="autoNextSetDelay"
                      type="number"
                      min={0}
                      className="w-20 text-center"
                      value={draft.autoNextSetDelay ?? 5}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          autoNextSetDelay: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Hotkeys */}
          <div>
            <div className="mb-4 pb-2 border-b flex items-center justify-between">
              <h3 className="text-md font-bold">Phím tắt</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    hotkeys: { ...DEFAULT_HOTKEYS },
                  }))
                }
              >
                Mặc định
              </Button>
            </div>
            <div className="grid gap-3">
              {(Object.keys(HOTKEY_LABELS) as (keyof HotkeyConfig)[]).map(
                (key) => (
                  <div
                    key={key}
                    className="grid grid-cols-[1fr_auto] items-center gap-4"
                  >
                    <Label className="text-sm">{HOTKEY_LABELS[key]}</Label>
                    <Button
                      type="button"
                      variant={recording === key ? "default" : "outline"}
                      onClick={() => setRecording(key)}
                      className={`inline-flex h-8 min-w-16 items-center justify-center px-3 font-mono text-sm transition-all ${
                        recording === key ? "animate-pulse" : ""
                      }`}
                    >
                      {recording === key
                        ? "Nhấn phím..."
                        : draft.hotkeys
                          ? getHotkeyLabel(draft.hotkeys[key])
                          : ""}
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Huỷ
          </Button>
          <Button onClick={handleSave} type="button">
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
