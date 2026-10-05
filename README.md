# DIET DELI - FOOD SUBSCRIPTION PLATFORM 🥗🍱

> **Hệ thống đặt suất ăn dinh dưỡng định kỳ (Meal-Prep Subscription System)**  
> Ứng dụng cung cấp giải pháp đăng ký gói ăn theo tuần/tháng, quản lý thực đơn dinh dưỡng linh hoạt theo lịch ISO, tự động khóa đơn chốt nguyên liệu cho bếp (22:00 T-1), và đảm bảo tính toàn vẹn giao dịch suất ăn thông qua Prisma Transactions.

---

## 📑 MỤC LỤC
1. [Tech Stack Thực Tế](#i-tech-stack-thực-tế)
2. [Hướng Dẫn Khởi Chạy (Quickstart)](#ii-hướng-dẫn-khởi-chạy-quickstart)
3. [Kiến Trúc Tổng Quan & Luồng Nghiệp Vụ](#iii-kiến-trúc-tổng-quan--luồng-nghiệp-vụ)
4. [Thiết Kế Cơ Sở Dữ Liệu (Prisma & PostgreSQL)](#iv-thiết-kế-cơ-sở-dữ-liệu-prisma--postgresql)
5. [Quy Tắc Nghiệp Vụ Cốt Lõi (Business Rules)](#v-quy-tắc-nghiệp-vụ-cốt-lõi-business-rules)
6. [Tài Liệu REST API](#vi-tài-liệu-rest-api)
7. [Cấu Trúc Thư Mục Dự Án](#vii-cấu-trúc-thư-mục-dự-án)

---

## I. TECH STACK THỰC TẾ

### 1. Frontend (`client/`)
- **Core:** React 19, TypeScript, Vite
- **Styling & UI Kit:** Tailwind CSS v4, HeroUI v3 (NextUI evolved), Lucide React
- **Data Fetching & State:** TanStack React Query v5, Zustand v5, Axios
- **Routing:** React Router v8 (với cơ chế Route Guards phân quyền `requireAuth`, `requireAdmin`, `GuestRoute`)
- **Carousel & UI Components:** Embla Carousel React

### 2. Backend (`server/`)
- **Framework:** NestJS 12 (TypeScript, ESM)
- **Database & ORM:** PostgreSQL, Prisma ORM 6
- **Authentication & RBAC:** JWT (`@nestjs/jwt`, `passport-jwt`), `bcryptjs`, Custom RBAC Guards (`JwtAuthGuard`, `AdminGuard`)
- **Validation:** `class-validator`, `class-transformer`
- **File Upload:** Multer, Cloudinary SDK
- **Payment & Notifications:** PayOS SDK (`@payos/node`), Nodemailer
- **Testing & Code Quality:** Vitest, Oxlint, Prettier

---

## II. HƯỚNG DẪN KHỞI CHẠY (QUICKSTART)

### 1. Yêu Cầu Môi Trường
- **Node.js:** >= 20.x (Khuyến nghị Node.js 22+)
- **PostgreSQL:** >= 15.x
- **Trình quản lý gói:** `npm`

---

### 2. Cài Đặt & Chạy Backend (`server/`)
```bash
cd server

# Cài đặt dependencies
npm install

# Tạo file cấu hình môi trường .env (tham khảo mẫu bên dưới)
cp .env.example .env # hoặc tạo file .env

# Đồng bộ schema với PostgreSQL
npx prisma db push

# (Tùy chọn) Chạy seed dữ liệu mẫu
npx prisma db seed

# Khởi chạy server development
npm run start:dev
# Backend chạy tại: http://localhost:3000 (Prefix: /api)
```

**Mẫu file `.env` cho Server:**
```env
PORT=3000
DATABASE_URL="postgresql://username:password@localhost:5432/dietdeli?schema=public"

# JWT Auth
JWT_SECRET="dietdeli_super_secret_jwt_key_2026"
JWT_EXPIRES_IN="1d"
JWT_REFRESH_SECRET="dietdeli_super_refresh_secret_key_2026"
JWT_REFRESH_EXPIRES_IN="7d"

# Cloudinary (Quản lý ảnh món ăn)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# PayOS (Cổng thanh toán QR)
PAYOS_CLIENT_ID="your_payos_client_id"
PAYOS_API_KEY="your_payos_api_key"
PAYOS_CHECKSUM_KEY="your_payos_checksum_key"
```

---

### 3. Cài Đặt & Chạy Frontend (`client/`)
```bash
cd client

# Cài đặt dependencies
npm install

# Khởi chạy ứng dụng với Vite
npm run dev
# Mở trình duyệt tại: http://localhost:5173
```

---

## III. KIẾN TRÚC TỔNG QUAN & LUỒNG NGHIỆP VỤ

### 1. Sơ Đồ Kiến Trúc Hệ Thống

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React 19 + HeroUI + TanStack Query)"]
        Landing["Trang Chủ & Tư Vấn\n(/, /baogia)"]
        AuthFlow["Đăng Ký & Đăng Nhập\n(/login, /register)"]
        UserPortal["Khách Hàng (User Dashboard)\n- Quản lý gói ăn (/user/mealpackage)\n- Đăng ký gói ăn (/user/registerpackage)\n- Thanh toán QR (/user/payment/:id)\n- Lịch đặt món tuần (/user/order)"]
        AdminPortal["Quản Trị Viên (Admin Portal)\n- Quản lý món ăn (/admin/dishes)\n- Lập thực đơn tuần (/admin/menu)\n- Quản lý đơn món (/admin/orders)\n- Duyệt khách & gói (/admin/customers)"]
    end

    subgraph Server["Backend API (NestJS Modular Architecture)"]
        AuthModule["AuthModule (JWT & RBAC Guards)"]
        PlansModule["PlansModule (Gói ăn MealPackage)"]
        DishModule["DishModule (Món ăn & Cloudinary)"]
        MenuModule["MenuModule (Thực đơn theo ngày)"]
        SubModule["SubscriptionModule (Gói của User & Duyệt đơn)"]
        OrderModule["OrderModule (Đặt/Hủy món & Deadline Engine)"]
    end

    subgraph DataTier["Data & Third-Party Services"]
        Postgres[(PostgreSQL Database)]
        CloudinaryAPI["Cloudinary CDN (Ảnh món ăn)"]
        PayOSAPI["PayOS Gateway (Thanh toán QR)"]
    end

    Client <-->|REST API + Bearer JWT| Server
    Server <-->|Prisma ORM (Transactions)| Postgres
    DishModule <-->|Upload Media| CloudinaryAPI
    SubModule <-->|Tạo Link & Webhook| PayOSAPI
```

---

### 2. Luồng Nghiệp Vụ Người Dùng (Customer Journey)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách Hàng
    participant Client as Web App (React)
    participant Server as Backend (NestJS)
    participant DB as PostgreSQL (Prisma)
    actor Admin as Quản Trị Viên / Bếp

    Customer->>Client: 1. Đăng ký & Nhận tư vấn dinh dưỡng
    Customer->>Client: 2. Chọn gói ăn (VD: Tuần 2 Bữa, 14 ngày)
    Client->>Server: POST /api/subscriptions/checkout
    Server->>DB: Tạo UserSubscription (Trạng thái UNPAID)
    Customer->>Client: 3. Thanh toán (Chuyển khoản QR)
    Admin->>Client: 4. Kiểm tra tài khoản & Duyệt thanh toán
    Client->>Server: PATCH /api/subscriptions/:id/status (PAID)
    Server->>DB: Kích hoạt gói (Cấp remainingMeals)
    Admin->>Client: 5. Lập thực đơn tuần cho bếp
    Client->>Server: POST /api/menus (Gán 2 món/ngày)
    Customer->>Client: 6. Vào trang /user/order đặt món cho các ngày trong tuần
    Note over Customer,Server: Kiểm tra deadline trước 22:00 của ngày hôm trước (T-1)
    Client->>Server: POST /api/order/book
    Server->>DB: Transaction: Tạo Order + Trừ remainingMeals
    Note over Admin,DB: Sau 22:00 T-1: Đơn bị khóa, Bếp chốt số lượng nấu
```

---

## IV. THIẾT KẾ CƠ SỞ DỮ LIỆU (PRISMA & POSTGRESQL)

### 1. Sơ Đồ Thực Thể Liên Kết (ERD)

```mermaid
erDiagram
    User ||--o{ UserSubscription : "đăng ký"
    User ||--o{ Order : "đặt hàng"
    MealPackage ||--o{ UserSubscription : "thuộc loại gói"
    MealPackage ||--o{ Order : "quy định định mức"
    Dish ||--o{ Menu : "phân bổ vào ngày"
    Dish ||--o{ OrderItem : "chọn làm món ăn"
    UserSubscription ||--o{ Order : "tiêu hao suất ăn"
    Order ||--o{ OrderItem : "chứa các món"

    User {
        Int id PK
        String name
        String email UK
        String password
        String phone
        DateTime dob
        String address
        String gender
        Int height
        Int weight
        String goal
        String activityLevel
        Boolean isAdmin
        String refreshToken
    }

    MealPackage {
        Int id PK
        String name "VD: Tuần 1 Bữa, Tuần 2 Bữa"
        Int caloriesPerMeal
        Int durationDays
        Int price
        Int totalMeals
        Boolean isActive
    }

    Dish {
        Int id PK
        String nameVi
        String nameEn
        String descriptionVi
        String descriptionEn
        String image "Cloudinary URL"
        Boolean isDeleted
    }

    Menu {
        Int id PK
        Int dishId FK
        DateTime date "Ngày áp dụng (Date only)"
    }

    UserSubscription {
        Int id PK
        Int idUser FK
        Int packageId FK
        DateTime startDate
        DateTime endDate
        paymentStatus paymentStatus "UNPAID | PAID | PROCESSING | CANCELLED | COMPLETED | EXPIRED"
        Int remainingMeals "Số suất ăn khả dụng còn lại"
        String planShippingAddress
        String planPhone
        String userNote
        String adminNote
    }

    Order {
        Int id PK
        Int userSubscriptionId FK
        Int userId FK
        Int packageId FK
        DateTime deliveryDate "Ngày nhận món"
        MealShift mealShift "LUNCH | DINNER"
        String shippingAddress
        String shippingNote
        OrderStatus status "ORDERED | COOKING | SHIPPING | COMPLETED | CANCELLED"
    }

    OrderItem {
        Int id PK
        Int orderId FK
        Int dishId FK
        Int quantity
    }
```

---

## V. QUY TẮC NGHIỆP VỤ CỐT LÕI (BUSINESS RULES)

### 1. Động Cơ Khóa Đơn (22:00 Cutoff Engine)
Để bộ phận bếp chốt danh sách nguyên vật liệu nấu nướng vào sáng sớm:
- **Nguyên tắc:** Việc **Đặt món** hoặc **Hủy món** cho ngày giao $T$ bắt buộc phải hoàn thành **trước 22:00 của ngày hôm trước ($T - 1$)**.
- **Cơ chế:** Được kiểm soát chặt chẽ cả ở Frontend (vô hiệu hóa nút bấm, gắn badge cảnh báo) lẫn Backend thông qua class [`OrderTimeValidator.validateDailyCutoff`](server/src/utils/order-time.util.ts). Mọi request sau 22:00 sẽ bị từ chối với mã lỗi `400 Bad Request`.

### 2. Cửa Sổ Đặt Món Tuần Mới (Weekly Booking Window)
- Menu tuần kế tiếp sẽ được mở cho khách hàng đặt trước từ **23:00 tối Thứ 6 đến trước 22:00 tối Chủ Nhật hàng tuần**.

### 3. Định Mức Gói Ăn Theo Ngày (Meal Package Quotas)
- **Gói 1 Bữa / Ngày (Tuần 1 Bữa, Tháng 1 Bữa):**
  - Khách hàng được quyền chọn **1 trong 2 món** có trong thực đơn của ngày.
  - Sau khi đã đặt 1 món, hệ thống khóa không cho đặt thêm món thứ 2. Nếu muốn đổi món, khách cần hủy món cũ trước 22:00 tối hôm trước.
- **Gói 2 Bữa / Ngày (Tuần 2 Bữa, Tháng 2 Bữa):**
  - Khách hàng có thể chọn **1 món hoặc cả 2 món** trong ngày.
  - Hệ thống tự động phân bổ ca ăn hợp lý (`LUNCH` cho món đầu tiên, `DINNER` cho món tiếp theo) nhằm ngăn chặn trùng ca giao hàng.
  - Ngăn chặn việc đặt trùng lặp cùng một món ăn trong cùng một ngày.

### 4. Tính Toàn Vẹn Giao Dịch Bữa Ăn (Prisma Atomic Transactions)
Để chống thất thoát số bữa ăn (race conditions):
- **Khi Khách Đặt Món (`POST /api/order/book`):**
  Hệ thống sử dụng `prisma.$transaction` để thực hiện đồng thời:
  1. Tạo bản ghi `Order` và các `OrderItem`.
  2. Giảm nguyên tử số bữa ăn: `userSubscription.update({ data: { remainingMeals: { decrement: totalMealsToDeduct } } })`.
- **Khi Khách Hủy Món (`PATCH /api/order/:id/cancel`):**
  Hệ thống sử dụng `prisma.$transaction` để thực hiện đồng thời:
  1. Chuyển trạng thái `Order` sang `CANCELLED`.
  2. Hoàn lại nguyên tử số bữa ăn: `userSubscription.update({ data: { remainingMeals: { increment: mealsToRefund } } })`.

---

## VI. TÀI LIỆU REST API

Tất cả các endpoint đều có tiền tố `/api`. Các endpoint có yêu cầu đăng nhập cần đính kèm Header: `Authorization: Bearer <JWT_ACCESS_TOKEN>`.

### 1. Xác Thực & Người Dùng (`/api/auth`)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Đăng ký tài khoản mới kèm hồ sơ dinh dưỡng |
| `POST` | `/api/auth/login` | Public | Đăng nhập hệ thống, trả về Token & User Info |
| `GET` | `/api/auth/profile` | Logged In | Lấy thông tin tài khoản đang đăng nhập |
| `GET` | `/api/auth/getme` | Logged In | Lấy chi tiết hồ sơ cá nhân |
| `POST` | `/api/auth/refresh` | Public | Cấp mới Access Token bằng Refresh Token |
| `POST` | `/api/auth/logout` | Logged In | Đăng xuất và vô hiệu hóa Refresh Token |

### 2. Quản Lý Gói Dinh Dưỡng (`/api/plans`)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/plans` | Logged In | Lấy danh mục toàn bộ gói ăn dinh dưỡng |
| `GET` | `/api/plans/:id` | Logged In | Lấy thông tin chi tiết một gói ăn |

### 3. Quản Lý Món Ăn (`/api/dish`)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dish` | Public | Lấy danh sách tất cả các món ăn (chưa bị xóa) |
| `GET` | `/api/dish/:id` | Public | Lấy chi tiết món ăn |
| `POST` | `/api/dish` | Logged In | Tạo món ăn mới (hỗ trợ upload ảnh multipart/form-data) |
| `PATCH` | `/api/dish/:id` | Logged In | Cập nhật thông tin và hình ảnh món ăn |
| `PATCH` | `/api/dish/:id/delete` | Logged In | Xóa mềm món ăn (`isDeleted: true`) |

### 4. Thực Đơn Theo Tuần (`/api/menus`)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/menus` | Public | Lấy danh sách thực đơn (Hỗ trợ query `?startDate=...&endDate=...`) |
| `GET` | `/api/menus/:id` | Public | Lấy chi tiết thực đơn theo ID |
| `POST` | `/api/menus` | Admin | Gán món ăn vào ngày trong tuần |
| `PATCH` | `/api/menus/:id` | Admin | Chỉnh sửa món ăn trong thực đơn |
| `DELETE`| `/api/menus/:id` | Admin | Xóa món ăn khỏi thực đơn ngày |

### 5. Đăng Ký & Quản Lý Gói Ăn (`/api/subscriptions`)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/subscriptions/checkout` | Logged In | Khách hàng đăng ký mua gói ăn mới |
| `GET` | `/api/subscriptions/my-subscriptions`| Logged In | Lấy danh sách gói ăn của người dùng đang đăng nhập |
| `GET` | `/api/subscriptions` | Admin | Lấy toàn bộ danh sách gói ăn để Admin quản lý |
| `PATCH` | `/api/subscriptions/:id/status` | Admin | Cập nhật trạng thái thanh toán gói (`PAID`, `UNPAID`, `CANCELLED`) |

### 6. Đặt Món Hàng Ngày (`/api/order`)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/order/book` | Logged In | Đặt món cho ngày giao (Trừ suất ăn nguyên tử qua Transaction) |
| `PATCH` | `/api/order/:id/cancel` | Logged In | Hủy đơn món trước 22:00 T-1 (Hoàn trả suất ăn nguyên tử) |
| `GET` | `/api/order/my-orders` | Logged In | Lấy lịch sử đặt món của khách (Query `?startDate=...&endDate=...`) |

---

## VII. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
dietdeli-2/
├── client/                                 # Ứng dụng Frontend (React 19 + Vite)
│   ├── public/                             # Tài nguyên tĩnh, ảnh món ăn
│   ├── src/
│   │   ├── api/                            # Axios API Clients (auth, dish, menu, order, subscription)
│   │   ├── components/                     # UI components dùng chung (admin, dashboard, main)
│   │   ├── pages/                          # Các màn hình chính
│   │   │   ├── admin/                      # Màn hình quản trị (DishesPage, MenuPage, OrdersPage, CustomersPage)
│   │   │   ├── user/                       # Màn hình khách hàng (OrderPage, MealPackagePage, PaymentPage, ...)
│   │   │   ├── BaoGia.tsx                  # Bảng giá & Tư vấn gói ăn
│   │   │   ├── IndexMain.tsx               # Trang chủ Landing page
│   │   │   ├── Login.tsx / Register.tsx    # Xác thực người dùng
│   │   ├── routes.tsx                      # Định tuyến & Phân quyền bảo vệ Route
│   │   ├── store/                          # Quản lý State toàn cục (Zustand)
│   │   └── utils/                          # Hàm tiện ích (Date time, ISO week formatter)
│   ├── package.json
│   └── vite.config.ts
│
└── server/                                 # Ứng dụng Backend (NestJS 12)
    ├── prisma/
    │   ├── schema.prisma                   # Khai báo cấu trúc bảng & liên kết quan hệ
    │   └── seed.ts                         # Script khởi tạo dữ liệu mẫu
    ├── src/
    │   ├── auth/                           # Đăng ký, đăng nhập, JWT, RBAC Guards (Admin, User)
    │   ├── plans/                          # Quản lý danh mục gói ăn
    │   ├── dish/                           # Quản lý món ăn, dinh dưỡng
    │   ├── menu/                           # Quản lý thực đơn hàng ngày / hàng tuần
    │   ├── subscription/                   # Quản lý đăng ký gói ăn của khách, duyệt thanh toán
    │   ├── order/                          # Nghiệp vụ đặt món, hủy món, trừ / hoàn bữa
    │   ├── upload/                         # Dịch vụ upload ảnh lên Cloudinary
    │   ├── prisma/                         # PrismaService kết nối Database
    │   ├── utils/                          # OrderTimeValidator (Động cơ kiểm tra 22:00 cutoff)
    │   ├── app.module.ts                   # Root Module của NestJS
    │   └── main.ts                         # Điểm khởi chạy ứng dụng, CORS, ValidationPipe
    ├── package.json
    └── tsconfig.json
```

---

## VIII. BẢN QUYỀN & GIẤY PHÉP

Dự án được xây dựng và phát triển phục vụ cho nền tảng dịch vụ dinh dưỡng **Diet Deli**. Mọi quyền được bảo lưu.
