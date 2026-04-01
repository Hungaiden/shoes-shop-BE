export interface myJwtPayload {
  userId: string; // ID người dùng trong database
  email: string; // Email để xác định người dùng
  role: string; // Phân quyền (RBAC)
  fullName: string; // Tên đầy đủ người dùng (để hiển thị)
  // isVerified: boolean;       // Tài khoản đã xác thực chưa (email/số điện thoại)
  iat?: number; // (auto) Thời điểm token được tạo
  exp?: number; // (auto) Thời điểm token hết hạn
}