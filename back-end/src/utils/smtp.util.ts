import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
// Gmail OAuth2 disabled (Proton Mail used via SMTP)
// import { google } from 'googleapis';

@Injectable()
export class SMTPUtil {
  // Gmail OAuth2 disabled (Proton Mail used via SMTP)
  // private gmailTransporter: nodemailer.Transporter;
  private brevoTransporter: nodemailer.Transporter;
  private smtpTransporter: nodemailer.Transporter;
  private readonly mailhogTransporter: nodemailer.Transporter;

  // Gmail OAuth2 config (disabled)
  // clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
  // clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
  // refreshToken = this.configService.get<string>('GOOGLE_REFRESH_TOKEN');
  // redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');
  // userEmail = this.configService.get<string>('GOOGLE_EMAIL');

  // Gmail OAuth2 client (disabled)
  // oAuth2Client = new google.auth.OAuth2(this.clientId, this.clientSecret, this.redirectUri);

  constructor(private readonly configService: ConfigService) {
    // Gmail OAuth2 credentials disabled
    // this.oAuth2Client.setCredentials({ refresh_token: this.refreshToken });

    this.mailhogTransporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAILHOG_HOST') || 'localhost',
      port: Number(this.configService.get<string>('MAILHOG_PORT')) || 1025,
      secure: false,
      tls: {
        rejectUnauthorized: true,
      },
    });
  }

  // Gmail OAuth2 disabled
  // private async createGmailTransporter(): Promise<nodemailer.Transporter> { ... }
  // like
  //  nodemailer.createTransport({
  //    service: 'gmail',
  //    auth: {
  //      type: 'OAuth2',
  //      user: this.userEmail,
  //      clientId: this.clientId,
  //      clientSecret: this.clientSecret,
  //      refreshToken: this.refreshToken,
  //      accessToken,
  //    },
  //    tls: {
  //      rejectUnauthorized: true,
  //    },
  //  })
  // private isGmailConfigured(): boolean { ... }

  private getProvider(): 'smtp' | 'mailhog' | 'brevo_api' | 'fallback' {
    const provider = (
      this.configService.get<string>('SMTP_PROVIDER') || 'fallback'
    ).toLowerCase();
    if (provider === 'smtp' || provider === 'mailhog') {
      return provider;
    }
    if (provider === 'brevo_api' || provider === 'brevo-api') {
      return 'brevo_api';
    }
    return 'fallback';
  }

  private isBrevoApiConfigured(): boolean {
    return Boolean(this.configService.get<string>('BREVO_API_KEY'));
  }

  private parseMailbox(value: unknown): { name?: string; email?: string } {
    if (!value) return {};

    // nodemailer can pass structured addresses; we only need the common fields
    if (typeof value === 'object') {
      const maybe = value as any;
      const email = maybe?.address || maybe?.email;
      const name = maybe?.name;
      if (typeof email === 'string') {
        return { email, name: typeof name === 'string' ? name : undefined };
      }
    }

    if (typeof value !== 'string') return {};

    // "Name <email@domain>"
    const match = value.match(/^\s*([^<]+?)\s*<\s*([^>]+?)\s*>\s*$/);
    if (match) {
      const name = match[1]?.trim();
      const email = match[2]?.trim();
      return { name: name || undefined, email: email || undefined };
    }

    // "email@domain"
    return { email: value.trim() || undefined };
  }

  private normalizeToList(
    to: unknown,
  ): Array<{ email: string; name?: string }> {
    const add = (
      item: unknown,
      acc: Array<{ email: string; name?: string }>,
    ) => {
      const parsed = this.parseMailbox(item);
      if (parsed.email) acc.push({ email: parsed.email, name: parsed.name });
    };

    const out: Array<{ email: string; name?: string }> = [];

    if (Array.isArray(to)) {
      for (const entry of to) add(entry, out);
      return out;
    }

    if (typeof to === 'string' && to.includes(',')) {
      for (const part of to.split(',')) add(part, out);
      return out;
    }

    add(to, out);
    return out;
  }

  async sendMailBrevoApiOnly(
    mailOptions: nodemailer.SendMailOptions,
  ): Promise<void> {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    if (!apiKey) {
      throw new Error('BREVO_API_KEY is missing');
    }

    const apiUrl =
      this.configService.get<string>('BREVO_API_URL') ||
      'https://api.brevo.com/v3/smtp/email';

    const senderEmail =
      this.configService.get<string>('BREVO_API_SENDER_EMAIL') ||
      this.configService.get<string>('BREVO_SMTP_FROM') ||
      this.parseMailbox(mailOptions.from).email;

    const senderName =
      this.configService.get<string>('BREVO_API_SENDER_NAME') ||
      this.parseMailbox(mailOptions.from).name ||
      undefined;

    if (!senderEmail) {
      throw new Error(
        'Brevo API sender email is missing (set BREVO_API_SENDER_EMAIL)',
      );
    }

    const toList = this.normalizeToList(mailOptions.to);
    if (!toList.length) {
      throw new Error('Mail "to" is missing');
    }

    const subject =
      typeof mailOptions.subject === 'string'
        ? mailOptions.subject
        : String(mailOptions.subject ?? '');
    const htmlContent =
      typeof mailOptions.html === 'string' ? mailOptions.html : undefined;
    const textContent =
      !htmlContent && typeof mailOptions.text === 'string'
        ? mailOptions.text
        : undefined;
    if (!htmlContent && !textContent) {
      throw new Error('Mail content is missing (provide html or text)');
    }

    const payload = {
      sender: {
        email: senderEmail,
        ...(senderName ? { name: senderName } : {}),
      },
      to: toList,
      subject,
      ...(htmlContent ? { htmlContent } : {}),
      ...(textContent ? { textContent } : {}),
    };

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(
        `Brevo API send failed (${res.status}): ${body || res.statusText}`,
      );
    }
  }

  private createSmtpTransporter(): nodemailer.Transporter {
    const host = this.configService.get<string>('SMTP_HOST') || 'localhost';
    const port = Number(this.configService.get<string>('SMTP_PORT')) || 1025;
    const user = this.configService.get<string>('SMTP_LOGIN') || '';
    const pass = this.configService.get<string>('SMTP_PASS') || '';
    const secure =
      this.configService.get<string>('SMTP_SECURE') === 'true' ||
      this.configService.get<string>('SMTP_SECURE') === '1';

    const auth = user && pass ? { user, pass } : undefined;

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth,
      tls: {
        rejectUnauthorized: true,
      },
    });
  }

  private createBrevoTransporter(): nodemailer.Transporter {
    const host =
      this.configService.get<string>('BREVO_SMTP_HOST') ||
      'smtp-relay.brevo.com';
    const port =
      Number(this.configService.get<string>('BREVO_SMTP_PORT')) || 587;
    const user = this.configService.get<string>('BREVO_SMTP_LOGIN') || '';
    const pass = this.configService.get<string>('BREVO_SMTP_PASS') || '';
    const secure =
      this.configService.get<string>('BREVO_SMTP_SECURE') === 'true' ||
      this.configService.get<string>('BREVO_SMTP_SECURE') === '1';

    const auth = user && pass ? { user, pass } : undefined;

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth,
      tls: {
        rejectUnauthorized: true,
      },
    });
  }

  async sendMail(mailOptions: nodemailer.SendMailOptions): Promise<void> {
    const provider = this.getProvider();
    if (provider === 'smtp') {
      await this.sendMailSmtpOnly(mailOptions);
      return;
    }
    if (provider === 'mailhog') {
      await this.sendMailMailhogOnly(mailOptions);
      return;
    }
    if (provider === 'brevo_api') {
      await this.sendMailBrevoApiOnly(mailOptions);
      return;
    }

    // Gmail OAuth2 disabled: fallback goes directly to Brevo, then Resend (SMTP), then MailHog

    try {
      if (this.isBrevoApiConfigured()) {
        await this.sendMailBrevoApiOnly(mailOptions);
        console.log('Email sent with Brevo API');
        return;
      }

      if (!this.brevoTransporter) {
        this.brevoTransporter = this.createBrevoTransporter();
      }
      // Override from address for Brevo
      const brevoMailOptions = {
        ...mailOptions,
        from:
          this.configService.get<string>('BREVO_SMTP_FROM') || mailOptions.from,
      };
      await this.brevoTransporter.sendMail(brevoMailOptions);
      console.log('Email sent with Brevo');
      return;
    } catch (brevoError) {
      const e = brevoError;
      console.error('Brevo error details:', {
        message: e?.message,
        code: e?.code,
      });
      console.warn('Brevo failed, fallback to Resend (SMTP)');
    }

    try {
      if (!this.smtpTransporter) {
        this.smtpTransporter = this.createSmtpTransporter();
      }
      await this.smtpTransporter.sendMail(mailOptions);
      console.log('Email sent with Resend (SMTP)');
      return;
    } catch (smtpError) {
      const e = smtpError;
      console.error('SMTP error details:', {
        message: e?.message,
        code: e?.code,
        response: e?.response,
        responseCode: e?.responseCode,
        stack: e?.stack,
      });
      console.warn('SMTP failed, fallback to MailHog');
    }

    try {
      await this.mailhogTransporter.sendMail(mailOptions);
      console.log('Email sent with MailHog');
    } catch (mailhogError) {
      console.error('MailHog failed:', mailhogError.message);
      throw mailhogError;
    }
  }

  async sendMailSmtpOnly(
    mailOptions: nodemailer.SendMailOptions,
  ): Promise<void> {
    if (!this.smtpTransporter) {
      this.smtpTransporter = this.createSmtpTransporter();
    }
    await this.smtpTransporter.sendMail(mailOptions);
    console.log('Email sent with SMTP (no fallback)');
  }

  async sendMailMailhogOnly(
    mailOptions: nodemailer.SendMailOptions,
  ): Promise<void> {
    await this.mailhogTransporter.sendMail(mailOptions);
    console.log('Email sent with MailHog (no fallback)');
  }

  // Gmail OAuth2 disabled
  // async sendMailGmailOnly(mailOptions: nodemailer.SendMailOptions): Promise<void> { ... }

  CreateMail(
    to: string,
    subject: string,
    html: string,
  ): {
    from: string;
    to: string;
    subject: string;
    html: string;
  } {
    const from =
      this.configService.get<string>('SMTP_FROM') ||
      // this.configService.get<string>('GOOGLE_EMAIL') ||
      '';
    return {
      from,
      to,
      subject,
      html,
    };
  }
}
