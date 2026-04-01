export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'RunStyle API',
    version: '1.0.0',
    description: 'API documentation for RunStyle e-commerce backend',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Development server' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      LoginBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'admin@runstyle.vn' },
          password: { type: 'string', example: '123456' },
        },
      },
      AccountCreate: {
        type: 'object',
        required: ['fullname', 'email', 'password'],
        properties: {
          fullname: { type: 'string', example: 'Nguyen Van A' },
          email: { type: 'string', example: 'user@example.com' },
          password: { type: 'string', example: '123456' },
          phone: { type: 'string', example: '0912345678' },
          role: { type: 'string', enum: ['admin', 'user'], example: 'user' },
        },
      },
      AccountUpdate: {
        type: 'object',
        properties: {
          fullname: { type: 'string' },
          phone: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'user'] },
          status: { type: 'string', enum: ['active', 'inactive'] },
        },
      },
      ProductCreate: {
        type: 'object',
        required: ['name', 'price'],
        properties: {
          name: { type: 'string', example: 'Áo thun basic' },
          sku: { type: 'string', example: 'SKU-001' },
          description: { type: 'string', example: 'Áo thun cotton 100%' },
          price: { type: 'number', example: 299000 },
          discount: { type: 'number', example: 10 },
          thumbnail: { type: 'string', example: 'https://...' },
          images: { type: 'array', items: { type: 'string' } },
          category_id: { type: 'string', example: '60f7b1c8e4b0c82a4c8e4b0c' },
          brand: { type: 'string', example: 'RunStyle' },
          stock: { type: 'number', example: 100 },
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'out_of_stock'],
            example: 'active',
          },
        },
      },
      ProductUpdate: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          price: { type: 'number' },
          discount: { type: 'number' },
          stock: { type: 'number' },
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'out_of_stock'],
          },
        },
      },
      ProductCategoryCreate: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', example: 'Áo' },
          description: { type: 'string', example: 'Danh mục áo các loại' },
          thumbnail: { type: 'string', example: 'https://...' },
          status: {
            type: 'string',
            enum: ['active', 'inactive'],
            example: 'active',
          },
        },
      },
      ProductBookingCreate: {
        type: 'object',
        required: ['user_id', 'items'],
        properties: {
          user_id: { type: 'string', example: '60f7b1c8e4b0c82a4c8e4b0c' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product_id: {
                  type: 'string',
                  example: '60f7b1c8e4b0c82a4c8e4b0c',
                },
                quantity: { type: 'number', example: 2 },
                size: { type: 'string', example: 'M' },
                color: { type: 'string', example: 'Đen' },
              },
            },
          },
          note: { type: 'string', example: 'Giao hàng giờ hành chính' },
        },
      },
      ProductBookingUpdate: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'completed', 'cancelled'],
            example: 'confirmed',
          },
          payment_status: {
            type: 'string',
            enum: ['unpaid', 'paid', 'failed'],
            example: 'paid',
          },
        },
      },
      ReviewCreate: {
        type: 'object',
        required: ['product_id', 'rating'],
        properties: {
          product_id: { type: 'string', example: '60f7b1c8e4b0c82a4c8e4b0c' },
          rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
          comment: { type: 'string', example: 'Sản phẩm rất tốt!' },
        },
      },
      SystemSetting: {
        type: 'object',
        properties: {
          websiteName: { type: 'string', example: 'RunStyle' },
          logo: { type: 'string', example: 'https://...' },
          phone: { type: 'string', example: '0912345678' },
          email: { type: 'string', example: 'contact@runstyle.vn' },
          address: { type: 'string', example: '123 Cầu Giấy, Hà Nội' },
        },
      },
      GroqRecommend: {
        type: 'object',
        properties: {
          keyword: { type: 'string', example: 'áo thun trắng' },
          budget: { type: 'number', example: 500000 },
          category: { type: 'string', example: 'Áo' },
        },
      },
    },
  },
  paths: {
    // ─────────────── AUTH ───────────────
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng nhập',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginBody' },
            },
          },
        },
        responses: {
          200: {
            description: 'Đăng nhập thành công, trả về accessToken & refreshToken',
          },
          401: { description: 'Sai email hoặc mật khẩu' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng xuất',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Đăng xuất thành công' } },
      },
    },
    '/auth/refresh-token': {
      patch: {
        tags: ['Auth'],
        summary: 'Làm mới access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { refreshToken: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Trả về accessToken mới' },
          401: { description: 'Refresh token không hợp lệ' },
        },
      },
    },

    // ─────────────── ACCOUNTS ───────────────
    '/accounts': {
      get: {
        tags: ['Accounts'],
        summary: 'Lấy danh sách tài khoản',
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', example: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', example: 10 },
          },
          { name: 'keyword', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Danh sách tài khoản' } },
      },
    },
    '/accounts/create': {
      post: {
        tags: ['Accounts'],
        summary: 'Tạo tài khoản mới',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AccountCreate' },
            },
          },
        },
        responses: {
          201: { description: 'Tạo tài khoản thành công' },
          400: { description: 'Dữ liệu không hợp lệ' },
        },
      },
    },
    '/accounts/detail/{id}': {
      get: {
        tags: ['Accounts'],
        summary: 'Lấy chi tiết tài khoản theo ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', example: '60f7b1c8e4b0c82a4c8e4b0c' },
          },
        ],
        responses: {
          200: { description: 'Chi tiết tài khoản' },
          404: { description: 'Không tìm thấy' },
        },
      },
    },
    '/accounts/update/{id}': {
      patch: {
        tags: ['Accounts'],
        summary: 'Cập nhật tài khoản',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AccountUpdate' },
            },
          },
        },
        responses: { 200: { description: 'Cập nhật thành công' } },
      },
    },
    '/accounts/deleteOne/{id}': {
      delete: {
        tags: ['Accounts'],
        summary: 'Xóa tài khoản',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { 200: { description: 'Xóa thành công' } },
      },
    },

    // ─────────────── PROFILE ───────────────
    '/profile': {
      get: {
        tags: ['Profile'],
        summary: 'Lấy thông tin cá nhân',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Thông tin tài khoản đang đăng nhập' },
        },
      },
    },
    '/profile/booking': {
      get: {
        tags: ['Profile'],
        summary: 'Lấy danh sách đơn hàng của bản thân',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Danh sách booking của user hiện tại' },
        },
      },
    },

    // ─────────────── DASHBOARD ───────────────
    '/dashboard/summary': {
      get: {
        tags: ['Dashboard'],
        summary: 'Lấy tổng quan thống kê',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Doanh thu, đơn hàng, sản phẩm, tài khoản' },
        },
      },
    },

    // ─────────────── PRODUCTS ───────────────
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'Lấy danh sách sản phẩm',
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', example: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', example: 10 },
          },
          { name: 'keyword', in: 'query', schema: { type: 'string' } },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['active', 'inactive', 'out_of_stock'],
            },
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', example: 'price' },
          },
          {
            name: 'sortType',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'] },
          },
        ],
        responses: { 200: { description: 'Danh sách sản phẩm có phân trang' } },
      },
    },
    '/products/create': {
      post: {
        tags: ['Products'],
        summary: 'Tạo sản phẩm mới',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductCreate' },
            },
          },
        },
        responses: {
          201: { description: 'Tạo thành công' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/products/detail/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Lấy chi tiết sản phẩm',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Chi tiết sản phẩm' },
          404: { description: 'Không tìm thấy' },
        },
      },
    },
    '/products/category/{category}': {
      get: {
        tags: ['Products'],
        summary: 'Lấy sản phẩm theo danh mục',
        parameters: [
          {
            name: 'category',
            in: 'path',
            required: true,
            schema: { type: 'string', example: '60f7b1c8e4b0c82a4c8e4b0c' },
          },
        ],
        responses: { 200: { description: 'Danh sách sản phẩm theo danh mục' } },
      },
    },
    '/products/update/{id}': {
      patch: {
        tags: ['Products'],
        summary: 'Cập nhật sản phẩm',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductUpdate' },
            },
          },
        },
        responses: { 200: { description: 'Cập nhật thành công' } },
      },
    },
    '/products/deleteOne/{id}': {
      delete: {
        tags: ['Products'],
        summary: 'Xóa sản phẩm (soft delete)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { 200: { description: 'Xóa thành công' } },
      },
    },

    // ─────────────── PRODUCT CATEGORIES ───────────────
    '/product-categories': {
      get: {
        tags: ['Product Categories'],
        summary: 'Lấy danh sách danh mục',
        responses: { 200: { description: 'Danh sách danh mục sản phẩm' } },
      },
    },
    '/product-categories/create': {
      post: {
        tags: ['Product Categories'],
        summary: 'Tạo danh mục mới',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductCategoryCreate' },
            },
          },
        },
        responses: { 201: { description: 'Tạo thành công' } },
      },
    },
    '/product-categories/detail/{id}': {
      get: {
        tags: ['Product Categories'],
        summary: 'Lấy chi tiết danh mục',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { 200: { description: 'Chi tiết danh mục' } },
      },
    },
    '/product-categories/update/{id}': {
      patch: {
        tags: ['Product Categories'],
        summary: 'Cập nhật danh mục',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductCategoryCreate' },
            },
          },
        },
        responses: { 200: { description: 'Cập nhật thành công' } },
      },
    },
    '/product-categories/delete/{id}': {
      delete: {
        tags: ['Product Categories'],
        summary: 'Xóa danh mục',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { 200: { description: 'Xóa thành công' } },
      },
    },

    // ─────────────── PRODUCT BOOKINGS ───────────────
    '/products/bookings/create': {
      post: {
        tags: ['Product Bookings'],
        summary: 'Tạo đơn hàng mới',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductBookingCreate' },
            },
          },
        },
        responses: { 201: { description: 'Tạo đơn hàng thành công' } },
      },
    },
    '/products/bookings/getAll': {
      get: {
        tags: ['Product Bookings'],
        summary: 'Lấy tất cả đơn hàng (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', example: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', example: 10 },
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['pending', 'confirmed', 'completed', 'cancelled'],
            },
          },
        ],
        responses: { 200: { description: 'Danh sách đơn hàng' } },
      },
    },
    '/products/bookings/detail/{bookingId}': {
      get: {
        tags: ['Product Bookings'],
        summary: 'Lấy chi tiết đơn hàng',
        parameters: [
          {
            name: 'bookingId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Chi tiết đơn hàng' },
          404: { description: 'Không tìm thấy' },
        },
      },
    },
    '/products/bookings/user/{userId}': {
      get: {
        tags: ['Product Bookings'],
        summary: 'Lấy đơn hàng theo user',
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { 200: { description: 'Danh sách đơn hàng của user' } },
      },
    },
    '/products/bookings/update/{bookingId}': {
      patch: {
        tags: ['Product Bookings'],
        summary: 'Cập nhật trạng thái đơn hàng',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'bookingId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductBookingUpdate' },
            },
          },
        },
        responses: { 200: { description: 'Cập nhật thành công' } },
      },
    },
    '/products/bookings/delete/{bookingId}': {
      delete: {
        tags: ['Product Bookings'],
        summary: 'Xóa đơn hàng',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'bookingId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { 200: { description: 'Xóa thành công' } },
      },
    },

    // ─────────────── PRODUCT REVIEWS ───────────────
    '/products/reviews': {
      get: {
        tags: ['Product Reviews'],
        summary: 'Lấy tất cả đánh giá',
        responses: { 200: { description: 'Danh sách đánh giá' } },
      },
    },
    '/products/reviews/create': {
      post: {
        tags: ['Product Reviews'],
        summary: 'Tạo đánh giá sản phẩm',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReviewCreate' },
            },
          },
        },
        responses: { 201: { description: 'Tạo đánh giá thành công' } },
      },
    },
    '/products/reviews/{productId}': {
      get: {
        tags: ['Product Reviews'],
        summary: 'Lấy đánh giá theo sản phẩm',
        parameters: [
          {
            name: 'productId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { 200: { description: 'Danh sách đánh giá của sản phẩm' } },
      },
    },
    '/products/reviews/approve/{id}': {
      patch: {
        tags: ['Product Reviews'],
        summary: 'Duyệt đánh giá (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { 200: { description: 'Duyệt thành công' } },
      },
    },
    '/products/reviews/update/{id}': {
      patch: {
        tags: ['Product Reviews'],
        summary: 'Cập nhật đánh giá',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  rating: { type: 'number', minimum: 1, maximum: 5 },
                  comment: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Cập nhật thành công' } },
      },
    },
    '/products/reviews/delete/{id}': {
      delete: {
        tags: ['Product Reviews'],
        summary: 'Xóa đánh giá',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { 200: { description: 'Xóa thành công' } },
      },
    },

    // ─────────────── UPLOAD ───────────────
    '/upload/single': {
      post: {
        tags: ['Upload'],
        summary: 'Upload 1 ảnh lên Cloudinary',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { image: { type: 'string', format: 'binary' } },
              },
            },
          },
        },
        responses: { 200: { description: 'URL ảnh đã upload' } },
      },
    },
    '/upload/multiple': {
      post: {
        tags: ['Upload'],
        summary: 'Upload nhiều ảnh (tối đa 5)',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  images: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Danh sách URL ảnh đã upload' } },
      },
    },

    // ─────────────── PAYMENT ───────────────
    '/payment/create-payment-url/{bookingId}': {
      post: {
        tags: ['Payment'],
        summary: 'Tạo link thanh toán VNPay',
        parameters: [
          {
            name: 'bookingId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { 200: { description: 'URL thanh toán VNPay' } },
      },
    },
    '/payment/vnpay-return': {
      get: {
        tags: ['Payment'],
        summary: 'VNPay callback sau thanh toán (redirect URL)',
        parameters: [
          { name: 'vnp_ResponseCode', in: 'query', schema: { type: 'string' } },
          { name: 'vnp_TxnRef', in: 'query', schema: { type: 'string' } },
          { name: 'vnp_SecureHash', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          302: { description: 'Redirect về FE kèm kết quả thanh toán' },
        },
      },
    },
    '/payment/vnpay-ipn': {
      get: {
        tags: ['Payment'],
        summary: 'VNPay IPN endpoint (server-to-server notification)',
        parameters: [
          { name: 'vnp_ResponseCode', in: 'query', schema: { type: 'string' } },
          { name: 'vnp_TxnRef', in: 'query', schema: { type: 'string' } },
          { name: 'vnp_SecureHash', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Xác nhận IPN thành công' } },
      },
    },

    // ─────────────── GROQ ───────────────
    '/groq/recommend-product': {
      post: {
        tags: ['Groq AI'],
        summary: 'Gợi ý sản phẩm bằng AI (Groq)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GroqRecommend' },
            },
          },
        },
        responses: { 200: { description: 'Danh sách sản phẩm được gợi ý' } },
      },
    },

    // ─────────────── SYSTEM SETTINGS ───────────────
    '/system-settings': {
      get: {
        tags: ['System Settings'],
        summary: 'Lấy cài đặt hệ thống',
        responses: { 200: { description: 'Thông tin cài đặt' } },
      },
      post: {
        tags: ['System Settings'],
        summary: 'Tạo cài đặt hệ thống',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SystemSetting' },
            },
          },
        },
        responses: { 201: { description: 'Tạo thành công' } },
      },
      patch: {
        tags: ['System Settings'],
        summary: 'Cập nhật cài đặt hệ thống',
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SystemSetting' },
            },
          },
        },
        responses: { 200: { description: 'Cập nhật thành công' } },
      },
    },
  },
};
