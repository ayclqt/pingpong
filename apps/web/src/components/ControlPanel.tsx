import {
  IconArrowsExchange,
  IconDeviceFloppy,
  IconMinus,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
  IconSettings,
} from "@tabler/icons-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Separator } from "@workspace/ui/components/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { useGameState } from "@workspace/ui/hooks/use-game-state"
import type { HotkeyConfig } from "@workspace/ui/lib/game-state"
import {
  countSetWins,
  exportSetHistoryCSV,
  exportSetHistoryTXT,
  getEventKeyCombo,
  getHotkeyLabel,
} from "@workspace/ui/lib/game-state"
import { useCallback, useEffect, useState } from "react"
import ImportExportDialog from "./ImportExportDialog"
import SettingsDialog from "./SettingsDialog"

export default function ControlPanel() {
  const {
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
  } = useGameState("control")

  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)
  const [lastAction, setLastAction] = useState<string | null>(null)

  // Flash action feedback
  const flash = useCallback((action: string) => {
    setLastAction(action)
    setTimeout(() => setLastAction(null), 400)
  }, [])

  // Implement Auto Next Set timer
  useEffect(() => {
    if (state.nextSetCountdown !== null && state.nextSetCountdown > 0) {
      const timer = setTimeout(() => {
        updateSettings({ nextSetCountdown: (state.nextSetCountdown ?? 1) - 1 })
      }, 1000)
      return () => clearTimeout(timer)
    } else if (state.nextSetCountdown === 0) {
      saveSetAndNext()
    }
  }, [state.nextSetCountdown, saveSetAndNext, updateSettings])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      const combo = getEventKeyCombo(e)
      const { hotkeys } = state
      // Determine which team is on which side
      const leftTeam = state.swapped ? "B" : "A"
      const rightTeam = state.swapped ? "A" : "B"

      if (combo === hotkeys.leftIncrement) {
        e.preventDefault()
        incrementScore(leftTeam)
        flash("left+")
      } else if (combo === hotkeys.leftDecrement) {
        e.preventDefault()
        decrementScore(leftTeam)
        flash("left-")
      } else if (combo === hotkeys.rightIncrement) {
        e.preventDefault()
        incrementScore(rightTeam)
        flash("right+")
      } else if (combo === hotkeys.rightDecrement) {
        e.preventDefault()
        decrementScore(rightTeam)
        flash("right-")
      } else if (combo === hotkeys.swapSides) {
        e.preventDefault()
        swapSides()
        flash("swap")
      } else if (combo === hotkeys.toggleServing) {
        e.preventDefault()
        toggleServing()
        flash("serve")
      } else if (combo === hotkeys.setIncrement) {
        e.preventDefault()
        setCurrentSet(1)
        flash("set+")
      } else if (combo === hotkeys.setDecrement) {
        e.preventDefault()
        setCurrentSet(-1)
        flash("set-")
      } else if (combo === hotkeys.saveSetAndNext) {
        e.preventDefault()
        saveSetAndNext()
        flash("saveset")
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [
    state,
    incrementScore,
    decrementScore,
    swapSides,
    toggleServing,
    setCurrentSet,
    saveSetAndNext,
    flash,
  ])

  const leftTeam = state.swapped ? "B" : "A"
  const rightTeam = state.swapped ? "A" : "B"
  const leftData = state.swapped ? state.teamB : state.teamA
  const rightData = state.swapped ? state.teamA : state.teamB
  const servingLeft =
    (state.serving === "A" && !state.swapped) ||
    (state.serving === "B" && state.swapped)
  const setWins = countSetWins(state.setHistory)

  const handleExport = (format: "json" | "csv" | "txt") => {
    let content = ""
    let mime = "text/plain"
    if (format === "json") {
      content = JSON.stringify(state, null, 2)
      mime = "application/json"
    } else if (format === "csv") {
      content = exportSetHistoryCSV(state)
      mime = "text/csv"
    } else {
      content = exportSetHistoryTXT(state)
    }

    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `pingpong_match_export.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (data) importState(data)
      } catch {
        alert("Lỗi không đọc được file JSON hợp lệ.")
      }
    }
    reader.readAsText(file)
    e.target.value = "" // Reset input
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-4xl flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            🏓 Bảng Tỉ Số Bóng Bàn
          </h1>
          <p className="text-muted-foreground text-sm">Trang điều khiển</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex gap-1 mr-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportExport(true)}
              className="text-xs"
            >
              <IconArrowsExchange className="mr-1 h-3 w-3" />
              Nhập/Xuất
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            <IconSettings className="size-4" />
            <span className="hidden md:inline">Cài đặt</span>
          </Button>
          <a href="/display" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              Hiển thị ↗
            </Button>
          </a>
        </div>
      </div>

      <Separator />

      {/* Set info + serve interval */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setCurrentSet(-1)}
            id="btn-set-decrement"
          >
            <IconMinus className="size-4" />
          </Button>
          <Badge variant="outline" className="px-4 py-1.5 text-base font-bold">
            Set {state.currentSet}
          </Badge>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setCurrentSet(1)}
            id="btn-set-increment"
          >
            <IconPlus className="size-4" />
          </Button>
        </div>

        {/* Set wins display */}
        {state.setHistory.length > 0 && (
          <Badge variant="secondary" className="gap-1 px-3 py-1.5 text-sm">
            {state.teamA.name}: {setWins.teamA} — {state.teamB.name}:{" "}
            {setWins.teamB}
          </Badge>
        )}
      </div>

      {state.nextSetCountdown !== null && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mx-auto text-emerald-500 animate-pulse text-center font-semibold text-sm max-w-sm w-full">
          Chuyển sang Set {state.currentSet + 1} trong {state.nextSetCountdown}{" "}
          giây...
          <Button
            variant="link"
            size="sm"
            className="block w-full text-center text-xs font-normal text-muted-foreground mt-1 cursor-pointer hover:text-white h-auto p-0"
            onClick={() => updateSettings({ nextSetCountdown: null })}
          >
            (Nhấn để huỷ)
          </Button>
        </div>
      )}

      {/* Teams */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 md:gap-6">
        {/* Left Team */}
        <TeamControl
          team={leftTeam}
          data={leftData}
          isServing={servingLeft}
          color={leftTeam === "A" ? "blue" : "red"}
          onIncrement={() => incrementScore(leftTeam)}
          onDecrement={() => decrementScore(leftTeam)}
          onNameChange={(name) => setTeamName(leftTeam, name)}
          lastAction={lastAction}
          hotkeys={state.hotkeys}
          side="left"
        />

        {/* Center Controls */}
        <div className="flex flex-col items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={swapSides}
            id="btn-swap"
            className={`transition-transform duration-300 ${lastAction === "swap" ? "rotate-180" : ""}`}
            title="Đổi sân"
          >
            <IconArrowsExchange className="size-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleServing}
            id="btn-serve"
            className={`transition-all duration-200 ${lastAction === "serve" ? "scale-110" : ""}`}
            title="Đổi quyền giao bóng"
          >
            <IconPlayerPlay className="size-5" />
          </Button>
        </div>

        {/* Right Team */}
        <TeamControl
          team={rightTeam}
          data={rightData}
          isServing={!servingLeft}
          color={rightTeam === "A" ? "blue" : "red"}
          onIncrement={() => incrementScore(rightTeam)}
          onDecrement={() => decrementScore(rightTeam)}
          onNameChange={(name) => setTeamName(rightTeam, name)}
          lastAction={lastAction}
          hotkeys={state.hotkeys}
          side="right"
        />
      </div>

      <Separator />

      {/* Save set & actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={saveSetAndNext} id="btn-save-set">
          <IconDeviceFloppy className="size-4" />
          Lưu set & tiếp
        </Button>

        {showResetConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-destructive text-sm font-medium">
              Xác nhận reset?
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                resetAll()
                setShowResetConfirm(false)
              }}
              id="btn-reset-confirm"
            >
              Đồng ý
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(false)}
              id="btn-reset-cancel"
            >
              Hủy
            </Button>
          </div>
        ) : (
          <Button
            variant="destructive"
            onClick={() => setShowResetConfirm(true)}
            id="btn-reset"
          >
            <IconRefresh className="size-4" />
            Reset tất cả
          </Button>
        )}
      </div>

      {/* Set History */}
      {state.setHistory.length > 0 && (
        <div className="mt-2">
          <h3 className="mb-2 text-sm font-semibold">Lịch sử các set</h3>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Set</TableHead>
                  <TableHead className="text-center">
                    {state.teamA.name}
                  </TableHead>
                  <TableHead className="text-center">
                    {state.teamB.name}
                  </TableHead>
                  <TableHead className="text-center">Thắng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.setHistory.map((record) => (
                  <TableRow key={record.setNumber}>
                    <TableCell className="font-medium">
                      {record.setNumber}
                    </TableCell>
                    <TableCell
                      className={`text-center font-mono font-bold ${record.teamA > record.teamB ? "text-emerald-400" : ""}`}
                    >
                      {record.teamA}
                    </TableCell>
                    <TableCell
                      className={`text-center font-mono font-bold ${record.teamB > record.teamA ? "text-emerald-400" : ""}`}
                    >
                      {record.teamB}
                    </TableCell>
                    <TableCell className="text-center">
                      {record.teamA > record.teamB
                        ? state.teamA.name
                        : record.teamB > record.teamA
                          ? state.teamB.name
                          : "Hòa"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Separator />

      {/* Hotkey Guide */}
      <div className="mt-auto">
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
          ⌨️ Phím tắt
        </h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground md:grid-cols-4">
          <HotkeyItem
            label={`Bên trái +1`}
            keyName={getHotkeyLabel(state.hotkeys.leftIncrement)}
          />
          <HotkeyItem
            label={`Bên trái -1`}
            keyName={getHotkeyLabel(state.hotkeys.leftDecrement)}
          />
          <HotkeyItem
            label={`Bên phải +1`}
            keyName={getHotkeyLabel(state.hotkeys.rightIncrement)}
          />
          <HotkeyItem
            label={`Bên phải -1`}
            keyName={getHotkeyLabel(state.hotkeys.rightDecrement)}
          />
          <HotkeyItem
            label="Đổi sân"
            keyName={getHotkeyLabel(state.hotkeys.swapSides)}
          />
          <HotkeyItem
            label="Đổi giao bóng"
            keyName={getHotkeyLabel(state.hotkeys.toggleServing)}
          />
          <HotkeyItem
            label="Set +1"
            keyName={getHotkeyLabel(state.hotkeys.setIncrement)}
          />
          <HotkeyItem
            label="Set -1"
            keyName={getHotkeyLabel(state.hotkeys.setDecrement)}
          />
        </div>
      </div>

      {/* Dialogs */}
      <ImportExportDialog
        open={showImportExport}
        onOpenChange={setShowImportExport}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Settings Dialog */}
      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        state={state}
        updateSettings={updateSettings}
      />
    </div>
  )
}

/* ---- Sub-components ---- */

function TeamControl({
  team,
  data,
  isServing,
  color,
  onIncrement,
  onDecrement,
  onNameChange,
  lastAction,
  hotkeys,
  side,
}: {
  team: "A" | "B"
  data: { name: string; score: number }
  isServing: boolean
  color: "blue" | "red"
  onIncrement: () => void
  onDecrement: () => void
  onNameChange: (name: string) => void
  lastAction: string | null
  hotkeys: HotkeyConfig
  side: "left" | "right"
}) {
  const actionPlus = `${side}+`
  const actionMinus = `${side}-`
  const isFlashPlus = lastAction === actionPlus
  const isFlashMinus = lastAction === actionMinus

  const borderColor =
    color === "blue"
      ? "border-blue-500/30 bg-blue-500/5"
      : "border-red-500/30 bg-red-500/5"

  const servingGlow =
    color === "blue"
      ? "shadow-[0_0_20px_rgba(59,130,246,0.3)]"
      : "shadow-[0_0_20px_rgba(239,68,68,0.3)]"

  // Hotkey labels by side
  const incKey =
    side === "left" ? hotkeys.leftIncrement : hotkeys.rightIncrement
  const decKey =
    side === "left" ? hotkeys.leftDecrement : hotkeys.rightDecrement

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition-all duration-300 ${borderColor} ${isServing ? servingGlow : ""}`}
    >
      {/* Serving indicator */}
      <div className="flex items-center gap-2 text-sm h-6">
        {isServing && (
          <span className="flex items-center gap-1 font-bold text-amber-400 animate-pulse uppercase tracking-widest text-[10px]">
            Giao bóng
          </span>
        )}
      </div>

      {/* Team name */}
      <div className="w-full">
        <Label
          htmlFor={`name-${team}`}
          className="text-xs text-muted-foreground"
        >
          Tên đội
        </Label>
        <Input
          id={`name-${team}`}
          value={data.name}
          onChange={(e) => onNameChange(e.target.value)}
          className="mt-1 text-center font-semibold"
        />
      </div>

      {/* Score */}
      <div
        className={`text-6xl font-black tabular-nums transition-transform duration-200 md:text-8xl ${isFlashPlus ? "scale-110 text-emerald-400" : ""} ${isFlashMinus ? "scale-90 text-red-400" : ""}`}
      >
        {data.score}
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="lg"
          onClick={onIncrement}
          id={`btn-${team}-increment`}
          className="h-12 w-16 text-lg font-bold"
        >
          <IconPlus className="size-5" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onDecrement}
          id={`btn-${team}-decrement`}
          className="h-12 w-16 text-lg font-bold"
        >
          <IconMinus className="size-5" />
        </Button>
      </div>

      {/* Hotkey hints — now by side, not team */}
      <div className="flex gap-3 text-xs text-muted-foreground">
        <span>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            {getHotkeyLabel(incKey)}
          </kbd>{" "}
          +1
        </span>
        <span>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            {getHotkeyLabel(decKey)}
          </kbd>{" "}
          -1
        </span>
      </div>
    </div>
  )
}

function HotkeyItem({ label, keyName }: { label: string; keyName: string }) {
  return (
    <div className="flex items-center gap-2">
      <kbd className="inline-flex h-5 min-w-6 items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px]">
        {keyName}
      </kbd>
      <span>{label}</span>
    </div>
  )
}
