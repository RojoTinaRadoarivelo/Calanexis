import { HttpStatus, Injectable } from '@nestjs/common';

import { reponsesDTO } from '../../utils/interfaces/responses';
import { SMTPUtil } from '../../utils/smtp.util';

@Injectable()
export class MfaService {
  private readonly verificationCodes = new Map<
    string,
    { code: string; expiresAt: Date }
  >();
  constructor(private readonly _smtpService: SMTPUtil) {}

  getVerificationCodes(email: string): {
    email: string;
    validation: { code: string; expiresAt: Date };
  } {
    const emails = this.verificationCodes.keys();
    let foundEmail: string = '';
    let foundCodes: any = null;
    let resultCode: any = null;

    for (const emailItem of emails) {
      if (emailItem && emailItem == email) {
        foundEmail = emailItem;

        foundCodes = this.verificationCodes.get(emailItem);
        break;
      }
    }

    if (foundEmail && (foundEmail != null || foundEmail != undefined)) {
      resultCode = {
        email: foundEmail,
        validation: {
          code: foundCodes.code,
          expiresAt: foundCodes.expiresAt,
        },
      };
    }

    return resultCode;
  }
  set VerificationCodes(verification: {
    email: string;
    validation: { code: string; expiresAt: Date };
  }) {
    this.verificationCodes.set(verification.email, verification.validation);
  }

  GenerateValidationCodeTo(email: string, expiresAt: Date): void {
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    this.VerificationCodes = {
      email,
      validation: {
        code,
        expiresAt,
      },
    };
  }

  async SendVerificationCode(
    email: string,
  ): Promise<reponsesDTO<object | null>> {
    let response: reponsesDTO<object | null>;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    this.GenerateValidationCodeTo(email, expiresAt);

    const resultValidation = this.getVerificationCodes(email);

    const bodyHml = `<!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Validation Email</title>
            </head>
            <body style="margin:0; padding:0; background-color:#ffffff; font-family:Arial, sans-serif;">
                <div style="background-color:#f2f2f2; border:1px solid #f2f2f2; border-radius:8px; padding:20px; max-width:1000px; margin:20px auto; text-align:center; box-shadow:0 2px 16px 1px rgba(0,0,0,0.05);">
                        <h1 style="font-size:56px; color:#cc8e18; margin:0 0 8px;">Calanexis</h1>
                        <div style="font-size:20px; margin-bottom:4px;">Your one-time verification code:</div>
                        <div style="font-size:32px; margin-bottom:12px;">${resultValidation.validation.code}</div>
                        <p style="font-size:18px; text-align:justify; max-width:800px; margin:24px auto;">Use the eight-digit code above to verify your identity. For security reasons, 
                        it will expire in 10 minutes. Never share this code with anyone. 
                        Calanexis will never call you or send you a text message to request this access code.</p>

                        <p style="margin-bottom:50px;">If you did not request this access code, <span style="font-weight:bold;"> please reset your password </span></p>
                </div>
            </body>
            </html>`;
    const mailToSend = this._smtpService.CreateMail(
      email,
      'Calanexis Verification code',
      bodyHml,
    );

    try {
      await this._smtpService.sendMail(mailToSend);
      response = {
        statusCode: 200,
        message: 'The verification code was sent to your email',
      };
      return response;
    } catch {
      response = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          'There was an error while sending the verification code to your email',
      };
      return response;
    }
  }

  verifyCode(email: string, code: string): reponsesDTO<object | null> {
    let response: reponsesDTO<object | null>;

    const storedData = this.getVerificationCodes(email);

    if (storedData && storedData.validation.code == code) {
      response = {
        statusCode: 200,
        message: 'Your email account was verified',
      };
      return response;
    }
    response = {
      statusCode: HttpStatus.NOT_FOUND,
      message: 'The verification of your email account failed',
    };
    return response;
  }
}
