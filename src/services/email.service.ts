import sgMail from "@sendgrid/mail";
import config from "@/config/index.config";
import { logger } from "@/lib/winston";
import { IEmailError, IEmailOptions } from "@/@types/interface";

class EmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.apiKey = config.SENDGRID_API_KEY as string;
    this.fromEmail = config.SENDGRID_FROM_EMAIL as string;
    this.fromName = config.SENDGRID_FROM_NAME || "Task Manager App";

    if (!this.apiKey) {
      throw new Error(
        "Missing required SendGrid environment variable: SENDGRID_API_KEY"
      );
    }

    if (!this.fromEmail) {
      throw new Error(
        "Missing required environment variable: SENDGRID_FROM_EMAIL"
      );
    }

    sgMail.setApiKey(this.apiKey);
  }

  async sendEmail({ to, subject, text, html }: IEmailOptions) {
    try {
      if (!to || !subject) {
        throw new Error(
          "Missing required email parameters: 'to' and 'subject' are mandatory"
        );
      }

      if (!text && !html) {
        throw new Error("Email must contain either text or html content");
      }

      const emailMessage = {
        to,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject,
        text,
        html,
      };

      const result = await sgMail.send(emailMessage);
      logger.info(
        "Email sent successfully via SendGrid:",
        result[0]?.statusCode || "Unknown status"
      );

      return {
        success: true,
        statusCode: result[0]?.statusCode,
        messageId: result[0]?.headers?.["x-message-id"],
        accepted: [to],
        result: result,
      };
    } catch (error: any) {
      logger.error(
        "SendGrid email error:",
        error.response?.body || error.message
      );
      const emailError: IEmailError = {
        success: false,
        error:
          error.response?.body?.errors?.[0]?.message ||
          error.message ||
          "Failed to send email",
        statusCode: error.code || 500,
      };

      throw emailError;
    }
  }
}

export default new EmailService();
