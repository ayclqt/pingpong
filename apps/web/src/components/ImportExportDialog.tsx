import { IconDownload, IconUpload } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { useRef, useState } from "react"

export default function ImportExportDialog({
  open,
  onOpenChange,
  onExport,
  onImport,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (format: "json" | "csv" | "txt") => void
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "txt">(
    "json"
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nhập / Xuất Dữ Liệu</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="export" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Xuất Dữ Liệu</TabsTrigger>
            <TabsTrigger value="import">Nhập Dữ Liệu</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Định dạng Xuất</Label>
              <Select
                value={exportFormat}
                onValueChange={(v) =>
                  setExportFormat(v as "json" | "csv" | "txt")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn định dạng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">Dữ liệu trận đấu (JSON)</SelectItem>
                  <SelectItem value="csv">Điểm Số Các Set (CSV)</SelectItem>
                  <SelectItem value="txt">Điểm Số Các Set (TXT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => onExport(exportFormat)}>
              <IconDownload className="w-4 h-4 mr-2" /> Tải Xuống
            </Button>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 pt-4">
            <p className="text-muted-foreground text-sm">
              Nhập kết quả trận đấu (JSON file) đã lưu trước đó để tiếp tục. Kết
              quả hiện tại sẽ bị ghi đè (không ảnh hưởng tới cài đặt).
            </p>
            <div className="flex justify-center py-4">
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  onImport(e)
                  onOpenChange(false)
                }}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <IconUpload className="w-4 h-4 mr-2" /> Chọn File JSON Mới
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
