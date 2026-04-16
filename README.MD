# 🏓 Bảng Tỉ Số Bóng Bàn (Ping Pong Scoreboard)

Một ứng dụng Bảng tỉ số bóng bàn hiện đại, mã nguồn mở được phát triển dựa trên kiến trúc Monorepo (Turborepo) với khả năng đồng bộ trạng thái thời gian thực giữa màn hình điều khiển và màn hình hiển thị trực tiếp thông qua `BroadcastChannel`. 

Dự án sở hữu giao diện chuyên nghiệp, mượt mà và tối giản của bảng tỉ số bóng bàn cao cấp, phù hợp cho các giải đấu từ nghiệp dư đến chuyên nghiệp.

---

## ✨ Tính Năng Nổi Bật

- **Đồng bộ thời gian thực (Real-time Sync):** Hai màn hình "Hiển thị" (Display) và "Điều khiển" (Control Panel) được đồng bộ ngay tức khắc trên cùng một thiết bị thông qua BroadcastChannel API, không độ trễ, không cần backend server hay database phụ trợ.
- **Quản lý Set đấu:** Tự động tăng điểm, lùi điểm, huỷ set, đếm ngược tự động sang set tiếp theo (Auto-Next-Set), và ghi lại lịch sử các set (S1, S2, S3...)
- **Export & Import mạnh mẽ:** Hỗ trợ Lưu và Tải lại quá trình trận đấu qua định dạng JSON. Cung cấp báo cáo xuất điểm ra định dạng CSV và TXT với UI gộp rất tiện dụng (dựa trên **shadcn/ui**).
- **Phím tắt (Hotkeys) linh hoạt:** Trọng tài hoàn toàn có thể sử dụng bàn phím để tăng/giảm điểm, đổi giao bóng hoặc đối bên. Hỗ trợ tuỳ chỉnh phím tắt theo ý thích.
- **Tuỳ chọn thể thức đa dạng:** Điểm kết thúc Set tuỳ biến (11, 21), cách biệt tối thiểu (bật/tắt chế độ Deuce cần cách nhau 2 điểm để thắng), chuyển giao bóng tự động sau `N` điểm.
- **UI/UX Tối Ưu:** Bảng điểm được phủ lớp gradient background xịn xò, các dòng chữ Auto-next-set, hiệu ứng glow (phát sáng) cho mũi tên hiển thị giao bóng vô cùng đẹp mắt.

---

## 🛠️ Tech Stack & Kiến trúc

Dự án chạy theo cấu trúc **Monorepo** với [Turborepo](https://turbo.build/repo/docs) bao gồm 2 workspace chính:
- `apps/web`: Ứng dụng chính biên dịch bằng [Astro](https://astro.build/) và [React](https://react.dev/). Astro dùng để dựng layout siêu nhẹ, React để quản lý state phức tạp.
- `packages/ui`: Thư viện Component chia sẻ độc lập được thiết kế hoàn toàn bằng [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS v4.

**Công nghệ lõi:**
- **Runtime & Gói:** `Bun`
- **Frontend framework:** `Astro 5` + `React 19`
- **Styling:** `TailwindCSS v4` + `LightningCSS`
- **UI Components:** `shadcn/ui` (Radix Primitives) + Icon từ `@tabler/icons-react`
- **Kiểm soát State:** Hook tự tùy biến dựa trên `localStorage` và `BroadcastChannel`.

---

## 🚀 Hướng Dẫn Cài Đặt (Local Development)

### 1. Yêu cầu hệ thống
- Cài đặt **[Bun](https://bun.sh/)** (Runtime siêu tốc hỗ trợ TypeScript native) phiên bản mới nhất.

### 2. Cài đặt các gói phụ thuộc
Clone dự án về máy và cài đặt bằng Bun:
```bash
git clone <repository_url> pingpong
cd pingpong
bun install
```

### 3. Khởi chạy Server Dev
Bật server ở môi trường phát triển (sẽ kích hoạt cả web app và ui packages):
```bash
bun dev
```

Server sẽ tự động khởi chạy tại `http://localhost:4321`.
- Mở **Trang Điều Khiển (Control Panel):** [`http://localhost:4321/`](http://localhost:4321/) (Dành cho Trọng Tài)
- Mở **Màn Hình Hiển Thị (Display):** [`http://localhost:4321/display`](http://localhost:4321/display) (Phóng to F11 ra màn hình lớn/máy chiếu cho Khán giả).

---

## 🌍 Triển Khai (Deploy Lên Github Pages)

Dự án này đã được cấu hình CI/CD đầy đủ bằng **Github Actions** để xuất bản trực tiếp lên **Github Pages** một cách hoàn toàn tự động! 

### Các bước phát hành:
1. Chuyển lên kho lưu trữ (Repository) của bạn ở Github -> Chuyển sang Tab `Settings`.
2. Vào mục `Pages`, thiết lập `Build and deployment` -> `Source` chọn thành **Github Actions**.
3. Mỗi khi bạn `git push origin main` mã nguồn mới lên nhánh `main`, Github Actions sẽ tự động kích hoạt tiến trình tạo build và triển khai bản tĩnh lên Github Pages ngay lập tức.
4. *Lưu ý: Mọi đường dẫn thư mục lưu trữ (Site/Base URL) đã được cấu hình bắt tự động dựa trên biến môi trường (CI environment).*

---

## 🎨 Hướng dẫn thay đổi Giao Diện (shadcn/ui)

Tất cả các components dùng chung trong repo này được quản lý tập trung ở `packages/ui/src/components`. Bạn có thể thay đổi, cập nhật hoặc tùy biến thêm UI bằng CLI của shadcn.

*Ví dụ thêm một component `dropdown-menu`:*
```bash
npx shadcn@latest add dropdown-menu -c apps/web
```
Thao tác này do Turborepo quản lý, nên nó sẽ tự động nhận biết monorepo framework và phân phối code về `packages/ui` đúng cách.

---

## 📝 Phím tắt (Mặc định)

- Tăng điểm trái: `Q` | Tăng điểm phải: `P`
- Giảm điểm trái: `A` | Giảm điểm phải: `L`
- Đổi giao bóng: `Space` 
- Đổi bên sân: `S`
- Lưu & Qua Set: `Ctrl+S`

*(Trọng tài có thể tuỳ biến lại tại Nút Settings (Cấu hình) góc dưới màn hình Control Panel)*
