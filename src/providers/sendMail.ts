/* eslint-disable no-undef */
import nodemailer from 'nodemailer';
import type { BaseBooking } from '../utils/types/bookingTypes';

type NewsletterPayload = {
  emails: string[];
  subject: string;
  title: string;
  content: string;
};

const NEWSLETTER_BATCH_SIZE = 50;

const normalizeEnvValue = (value?: string) => {
  return String(value || '')
    .trim()
    .replace(/^"|"$/g, '');
};

const normalizeAppPassword = (value?: string) => {
  // Gmail app password is 16 chars; users often copy with spaces every 4 chars.
  return normalizeEnvValue(value).replace(/\s+/g, '');
};

const mapMailError = (error: any) => {
  const message = String(error?.message || '');
  const isInvalidCredential =
    error?.responseCode === 535 || /Invalid login|BadCredentials/i.test(message);

  if (isInvalidCredential) {
    return new Error(
      'Đăng nhập SMTP thất bại: kiểm tra EMAIL_USER và EMAIL_PASS (Gmail App Password 16 ký tự, không chứa khoảng trắng).' +
        ' Nếu vừa đổi mật khẩu/app-password, hãy khởi động lại backend.',
    );
  }

  return error instanceof Error ? error : new Error('Gửi email thất bại');
};

const createTransporter = () => {
  const emailUser = normalizeEnvValue(process.env.EMAIL_USER);
  const emailPass = normalizeAppPassword(process.env.EMAIL_PASS);

  if (!emailUser || !emailPass) {
    throw new Error('Thiếu cấu hình EMAIL_USER hoặc EMAIL_PASS trong môi trường backend');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

const chunkList = (values: string[], batchSize: number): string[][] => {
  if (batchSize <= 0) return [values];

  const chunks: string[][] = [];
  for (let index = 0; index < values.length; index += batchSize) {
    chunks.push(values.slice(index, index + batchSize));
  }
  return chunks;
};

const toHtmlContent = (value: string) => {
  const trimmed = (value || '').trim();
  if (!trimmed) return '<p>(Không có nội dung)</p>';

  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);
  if (looksLikeHtml) return trimmed;

  return trimmed.replace(/\n/g, '<br/>');
};

export const sendBookingEmail = async ({ userEmail, bookingType, data }: BaseBooking) => {
  try {
    const transporter = createTransporter();

    let subject = '';
    let htmlContent = '';

    if (bookingType === 'tour') {
      subject = '🎉 Xác nhận đặt tour thành công';

      htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50;">✅ Bạn đã đặt tour thành công!</h2>
          <p style="font-size: 16px; color: #555;">
            Xin chào quý khách,<br>
            Cảm ơn bạn đã lựa chọn dịch vụ của chúng tôi. Dưới đây là thông tin chi tiết về đơn đặt tour của bạn:
          </p>

          <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">🧭 Tên tour:</td>
              <td style="padding: 8px;">${data.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">📅 Ngày khởi hành:</td>
              <td style="padding: 8px;">${new Date(data.start_date).toLocaleDateString('vi-VN')}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">👥 Số người:</td>
              <td style="padding: 8px;">${data.number_of_people}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">💰 Tổng tiền:</td>
              <td style="padding: 8px; color: #e74c3c;"><strong>${data.total_price.toLocaleString('vi-VN')} VNĐ</strong></td>
            </tr>
          </table>

          <p style="margin-top: 30px; font-size: 14px; color: #888;">
            Nếu bạn có bất kỳ thắc mắc hoặc muốn chỉnh sửa thông tin đặt tour, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.
          </p>

          <p style="font-size: 14px; color: #888;">
            Trân trọng,<br>
            <strong>Đội ngũ TourBooking</strong>
          </p>

          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #bbb; text-align: center;">
            Đây là email tự động. Vui lòng không trả lời trực tiếp email này.
          </p>
        </div>
      </div>
    `;
    }

    await transporter.sendMail({
      from: `"TourBooking" <${normalizeEnvValue(process.env.EMAIL_USER)}>`,
      to: userEmail,
      subject,
      html: htmlContent,
    });
  } catch (error: any) {
    throw mapMailError(error);
  }
};

export const sendNewsletterCampaignEmails = async ({
  emails,
  subject,
  title,
  content,
}: NewsletterPayload) => {
  try {
    const validEmails = (emails || []).map((email) => String(email || '').trim()).filter(Boolean);

    if (validEmails.length === 0) {
      return 0;
    }

    const transporter = createTransporter();
    const contentHtml = toHtmlContent(content);
    const html = `
    <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #f6f7fb;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 10px; padding: 28px; border: 1px solid #eceff5;">
        <h2 style="margin: 0 0 12px; color: #111827;">${title}</h2>
        <div style="font-size: 15px; line-height: 1.7; color: #374151;">${contentHtml}</div>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
          Bạn nhận email này vì đã đăng ký bản tin ưu đãi của RunStyle.
        </p>
      </div>
    </div>
  `;

    const emailBatches = chunkList(validEmails, NEWSLETTER_BATCH_SIZE);
    const fromEmail = normalizeEnvValue(process.env.EMAIL_USER);

    for (const batch of emailBatches) {
      await transporter.sendMail({
        from: `"RunStyle" <${fromEmail}>`,
        to: fromEmail,
        bcc: batch.join(', '),
        subject,
        html,
      });
    }

    return validEmails.length;
  } catch (error: any) {
    throw mapMailError(error);
  }
};
