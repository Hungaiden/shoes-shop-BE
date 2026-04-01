# Book Tour — Backend API

Backend RESTful API cho hệ thống quản lý sản phẩm thời trang.

## Công nghệ sử dụngX

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
| Vercel                      | Deploy (Serverless)                     |

## Cấu trúc thư mục

```
book-tour-be/
├── sever.ts                  # Entry point
├── vercel.json               # Cấu hình deploy Vercel
├── http/                     # File test API (REST Client)
│   ├── auth.http
│   ├── accounts.http
│   ├── tours.http
│   ├── hotels.http
│   ├── flights.http
│   ├── products.http
│   └── misc.http
└── src/
    ├── config/               # Cấu hình (DB, CORS, Cloudinary, VNPay...)
    ├── controllers/          # Xử lý request/response
    │   ├── admin/            # API dành cho admin
    │   └── client/           # API dành cho client
    ├── dto/                  # Data Transfer Objects
    ├── middlewares/          # Auth middleware, upload middleware
    ├── models/               # Mongoose schema
    │   ├── accounts/
    │   ├── tours/
    │   ├── hotels/
    │   ├── flights/
    │   └── products/
    ├── providers/            # JWT provider, gửi mail
    ├── routes/               # Định nghĩa route
    │   ├── admin/
    │   └── client/
    ├── services/             # Business logic
    ├── utils/                # Hàm tiện ích, types
    └── validations/          # Zod schema validation
```

## Cài đặt & Chạy

### 1. Clone dự án

```bash
git clone <repo-url>
cd book-tour-be
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
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/book-tour-management

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

# Groq AI (tuỳ chọn)
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

### Auth

| Method | Endpoint              | Mô tả                  |
| ------ | --------------------- | ---------------------- |
| POST   | `/auth/register`      | Đăng ký tài khoản      |
| POST   | `/auth/login`         | Đăng nhập              |
| POST   | `/auth/refresh-token` | Làm mới Access Token   |
| GET    | `/auth/google`        | Đăng nhập Google OAuth |

### Admin

| Module        | Prefix                   |
| ------------- | ------------------------ |
| Tài khoản     | `/admin/accounts`        |
| Tour          | `/admin/tours`           |
| Danh mục tour | `/admin/tour-categories` |
| Khách sạn     | `/admin/hotels`          |
| Loại phòng    | `/admin/room-types`      |
| Chuyến bay    | `/admin/flights`         |
| Hãng bay      | `/admin/airlines`        |
| Sản phẩm      | `/admin/products`        |
| Upload        | `/admin/upload`          |
| Dashboard     | `/admin/dashboard`       |

### Client

| Module     | Prefix      |
| ---------- | ----------- |
| Tour       | `/tours`    |
| Khách sạn  | `/hotels`   |
| Chuyến bay | `/flights`  |
| Sản phẩm   | `/products` |
| Thanh toán | `/payment`  |

> Xem chi tiết các request trong thư mục `http/` (dùng với VS Code extension **REST Client**)

## Deploy

Dự án được deploy trên **Vercel** (Serverless Functions).

```
Production: https://book-tour-khaki.vercel.app
```

Cấu hình deploy nằm trong `vercel.json` — entry point là `sever.ts`.

## Lưu ý

- **MongoDB**: Dùng MongoDB Atlas (cloud). Whitelist IP trong Atlas nếu bị từ chối kết nối.
- **Gmail**: Dùng [App Password](https://myaccount.google.com/apppasswords) thay vì mật khẩu thường.
- **VNPay**: Môi trường sandbox — dùng thẻ test do VNPay cung cấp.
- **Cloudinary**: Tạo tài khoản miễn phí tại [cloudinary.com](https://cloudinary.com).

## License

ISC
