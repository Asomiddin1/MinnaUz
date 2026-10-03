import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });
      this.logger.log(
        `📧 SMTP Email xizmati ulandi (${host}:${port}, user: ${user})`,
      );
    } else {
      this.logger.warn(
        '⚠️ SMTP_USER yoki SMTP_PASS .env faylida topilmadi. Email yuborilmaydi (OTP faqat terminalda koʻrinadi).',
      );
    }
  }

  async sendOtpEmail(toEmail: string, code: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.log(`[DEV MODE] OTP kodi (${toEmail}): ${code}`);
      return true;
    }

    const from =
      process.env.SMTP_FROM || `"MinnaUz" <${process.env.SMTP_USER}>`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #18181b; margin: 0 0 8px 0; letter-spacing: -0.5px;">MinnaUz 2.0</h1>
          <p style="font-size: 14px; color: #71717a; margin: 0;">Yapon tili taʼlim platformasi</p>
        </div>

        <div style="background-color: #f4f4f5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 14px; color: #52525b; margin: 0 0 12px 0;">Kirish va hisobni tasdiqlash kodi:</p>
          <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0071e3; margin: 8px 0; font-family: monospace;">
            ${code}
          </div>
          <p style="font-size: 12px; color: #a1a1aa; margin: 12px 0 0 0;">Kod 5 daqiqa davomida amal qiladi.</p>
        </div>

        <p style="font-size: 13px; color: #71717a; line-height: 1.6; margin: 0 0 16px 0;">
          Agar siz ushbu kodni soʻramagan boʻlsangiz, ushbu xabarni eʼtiborsiz qoldiring. Hech kimga kodingizni bermang.
        </p>

        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0 16px 0;" />

        <p style="font-size: 11px; color: #a1a1aa; text-align: center; margin: 0;">
          © 2026 MinnaUz. Barcha huquqlar himoyalangan. Toshkent, Oʻzbekiston.
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from,
        to: toEmail,
        subject: `MinnaUz - Tasdiqlash kodi: ${code}`,
        text: `MinnaUz platformasiga kirish kodingiz: ${code} (5 daqiqa amal qiladi).`,
        html: htmlContent,
      });

      this.logger.log(
        `✅ Tasdiqlash kodi (${code}) ${toEmail} manziliga yuborildi.`,
      );
      return true;
    } catch (err: any) {
      this.logger.error(
        `❌ Email yuborishda xatolik (${toEmail}):`,
        err.message,
      );
      return false;
    }
  }
}
