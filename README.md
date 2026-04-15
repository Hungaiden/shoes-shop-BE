# Shoes Shop — Backend API

Backend RESTful API cho nền tảng bán giày trực tuyến.

## Công nghệ sử dụng

| Công nghệ                   | Mục đích                                |
| --------------------------- | --------------------------------------- |
| Node.js + Express.js        | Web framework                           |
| TypeScript                  | Type safety                             |
| MongoDB + Mongoose          | Database                                |
| JWT                         | Xác thực (Access Token + Refresh Token) |
| Passport + Google OAuth 2.0 | Đăng nhập qua Google                    |
| Zod                         | Validation dữ liệu đầu vào              |
| Cloudinary                  | Upload & lưu trữ ảnh                    |
| Nodemailer                  | Gửi email                               |
| VNPay                       | Tích hợp thanh toán                     |
| Multer                      | Xử lý upload file                       |
| Groq AI                     | Chatbot & AI features                   |
| Vercel                      | Deploy (Serverless)                     |

## Cấu trúc thư mục

```
shoes-shop-be/
├── sever.ts                  # Entry point
├── vercel.json               # Cấu hình deploy Vercel
├── http/                     # File test API (REST Client)
│   ├── auth.http
│   ├── accounts.http
│   ├── products.http
│   ├── cart.http
│   └── misc.http
└── src/
    ├── config/               # Cấu hình (DB, CORS, Cloudinary, VNPay...)
    ├── controllers/          # Xử lý request/response
    │   ├── admin/            # API dành cho admin
    │   │   ├── accounts/
    │   │   ├── products/
    │   │   ├── cart/
    │   │   ├── discounts/
    │   │   ├── orders/
    │   │   ├── reviews/
    │   │   ├── dashboard/
    │   │   └── marketing/
    │   ├── client/           # API dành cho khách hàng
    │   │   ├── cart/
    │   │   ├── orders/
    │   │   └── newsletter/
    │   └── payment/          # Xử lý thanh toán
    ├── dto/                  # Data Transfer Objects
    ├── middlewares/          # Auth middleware, upload middleware
    ├── models/               # Mongoose schema
    │   ├── accounts/
    │   ├── products/
    │   ├── marketing/
    │   └── settings/
    ├── providers/            # JWT provider, gửi mail, Groq AI
    ├── routes/               # Định nghĩa route
    │   ├── admin/
    │   └── client/
    ├── services/             # Business logic
    │   ├── admin/
    │   ├── client/
    │   └── payment/
    ├── sockets/              # WebSocket realtime
    ├── utils/                # Hàm tiện ích, types
    ├── validations/          # Zod schema validation
    └── config/               # Cấu hình hệ thống
```

## Cài đặt & Chạy

### 1. Clone dự án

```bash
git clone <repo-url>
cd shoes-shop-be
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Tạo file `.env`

Tạo file `.env` ở thư mục gốc với nội dung sau:

```env
PORT=3000

# MongoDB Atlas
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/shoes-shop

# JWT
ACCESS_TOKEN_SECRET_SIGNATURE=your_access_token_secret
REFRESH_TOKEN_SECRET_SIGNATURE=your_refresh_token_secret

# Cloudinary
CLOUD_NAME=your_cloud_name
CLOUD_KEY=your_cloud_key
CLOUD_SECRET=your_cloud_secret

# Email (Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Groq AI
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile

# VNPay (Sandbox)
VNP_TMN_CODE=your_tmn_code
VNP_HASH_SECRET=your_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_API=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
VNP_RETURN_URL=http://localhost:3000/payment/vnpay-return
```

### 4. Chạy môi trường development

```bash
npm run dev
```

> Server mặc định chạy tại `http://localhost:3000`

### 5. Build production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint              | Mô tả                  |
| ------ | --------------------- | ---------------------- |
| POST   | `/auth/register`      | Đăng ký tài khoản      |
| POST   | `/auth/login`         | Đăng nhập              |
| POST   | `/auth/refresh-token` | Làm mới Access Token   |
| GET    | `/auth/google`        | Đăng nhập Google OAuth |
| POST   | `/auth/logout`        | Đăng xuất              |

### Admin Panel

| Module      | Prefix              | Mô tả                       |
| ----------- | ------------------- | --------------------------- |
| Tài khoản   | `/admin/accounts`   | Quản lý người dùng          |
| Sản phẩm    | `/admin/products`   | Thêm/sửa/xóa sản phẩm       |
| Giỏ hàng    | `/admin/cart`       | Quản lý giỏ hàng khách hàng |
| Đơn hàng    | `/admin/orders`     | Quản lý đơn hàng            |
| Đánh giá    | `/admin/reviews`    | Quản lý bình luận/đánh giá  |
| Mã giảm giá | `/admin/discounts`  | Tạo & quản lý khuyến mãi    |
| Bản tin     | `/admin/newsletter` | Quản lý email marketing     |
| Dashboard   | `/admin/dashboard`  | Thống kê & báo cáo          |
| Upload      | `/admin/upload`     | Upload ảnh sản phẩm         |

### Client API

| Module     | Prefix        | Mô tả                      |
| ---------- | ------------- | -------------------------- |
| Sản phẩm   | `/products`   | Danh sách & chi tiết giày  |
| Giỏ hàng   | `/cart`       | Thêm/xóa/cập nhật giỏ hàng |
| Đơn hàng   | `/orders`     | Lịch sử mua hàng           |
| Thanh toán | `/payment`    | Tích hợp VNPay             |
| Bình luận  | `/reviews`    | Đánh giá sản phẩm          |
| Bản tin    | `/newsletter` | Đăng ký nhận tin           |

> Xem chi tiết các request trong thư mục `http/` (dùng với VS Code extension **REST Client**)

## Tính năng chính

✅ **Quản lý sản phẩm** - Thêm, sửa, xóa giày với hình ảnh từ Cloudinary  
✅ **Giỏ hàng & Đơn hàng** - Quản lý đầy đủ quy trình mua hàng  
✅ **Thanh toán VNPay** - Tích hợp cổng thanh toán Việt Nam  
✅ **Đăng nhập Google** - Xác thực nhanh qua Google OAuth  
✅ **Bình luận & Đánh giá** - Khách hàng đánh giá sản phẩm  
✅ **Khuyến mãi & Mã giảm giá** - Hệ thống chiết khấu linh hoạt  
✅ **Email Marketing** - Gửi newsletter & thông báo qua email  
✅ **Chatbot AI** - Hỗ trợ khách hàng với Groq AI  
✅ **Dashboard Admin** - Thống kê bán hàng & chi tiết tài chính

## Deploy

Dự án được deploy trên **Vercel** (Serverless Functions).

Cấu hình deploy nằm trong `vercel.json` — entry point là `sever.ts`.

## Lưu ý

- **MongoDB**: Dùng MongoDB Atlas (cloud). Whitelist IP trong Atlas nếu bị từ chối kết nối.
- **Gmail**: Dùng [App Password](https://myaccount.google.com/apppasswords) thay vì mật khẩu thường.
- **VNPay**: Môi trường sandbox — dùng thẻ test do VNPay cung cấp.
- **Cloudinary**: Tạo tài khoản miễn phí tại [cloudinary.com](https://cloudinary.com).
- **Groq API**: Đăng ký miễn phí tại [console.groq.com](https://console.groq.com).

## License

ISC
