import { IEmailTemplate } from "@/@types/interface";

const emailWrapper = (content: string, footer?: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Task Manager</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            ${content}
            ${footer || ""}
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
                This email was sent by Task Manager<br>
                If you're having trouble clicking the button, copy and paste the URL into your web browser.
            </p>
        </div>
    </body>
    </html>
  `;
};

const actionButton = (url: string, text: string, color: string): string => {
  return `
    <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" 
           style="background-color: ${color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            ${text}
        </a>
    </div>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">
        ${url}
    </p>
  `;
};

export const verificationEmail = (verificationURL: string): IEmailTemplate => {
  const html = emailWrapper(
    `
      <h2>Verify Your Email Address</h2>
      <p>Hello,</p>
      <p>Thank you for signing up! Please verify your email address to complete your account setup. Click the button below to verify your email:</p>
      
      ${actionButton(verificationURL, "Verify Email", "#28a745")}
      
      <p style="color: #dc3545; font-weight: bold;">
          This link will expire in 10 minutes for security reasons.
      </p>
    `
  );

  const text = `
Account Verification

Thank you for signing up! Please verify your email address to complete your account setup.

Verify your email by visiting this link:
${verificationURL}

This link will expire in 10 minutes.
  `;

  return { html, text };
};

export const passwordResetEmail = (resetURL: string): IEmailTemplate => {
  const html = emailWrapper(
    `
      <h2>Password Reset Request</h2>
      <p>Hello,</p>
      <p>You requested a password reset for your account. Click the button below to reset your password:</p>
      
      ${actionButton(resetURL, "Reset Password", "#007bff")}
      
      <p style="color: #dc3545; font-weight: bold;">
          This link will expire in 10 minutes for security reasons.
      </p>
      
      <p>If you didn't request this password reset, please ignore this email or contact our support team.</p>
    `
  );

  const text = `
Password Reset Request

You requested a password reset for your account.

Reset your password by visiting this link:
${resetURL}

This link will expire in 10 minutes.

If you didn't request this password reset, please ignore this email.
  `;

  return { html, text };
};

export const welcomeEmail = (displayName: string): IEmailTemplate => {
  const html = emailWrapper(
    `
      <h2>Welcome to Task Manager!</h2>
      <p>Hi ${displayName},</p>
      <p>Your account has been successfully verified. You can now start using all features of Task Manager.</p>
      <p>Get started by creating your first workspace and inviting team members!</p>
    `
  );

  const text = `
Welcome to Task Manager!

Hi ${displayName},

Your account has been successfully verified. You can now start using all features of Task Manager.

Get started by creating your first workspace and inviting team members!
  `;

  return { html, text };
};

export const passwordChangedEmail = (userEmail: string): IEmailTemplate => {
  const html = emailWrapper(
    `
      <h2>Password Changed Successfully</h2>
      <p>Hello,</p>
      <p>This is to confirm that your password has been changed successfully.</p>
      <p>If you did not make this change, please contact our support team immediately.</p>
      <p style="color: #dc3545; font-weight: bold;">
          For security reasons, you will need to log in again with your new password.
      </p>
    `
  );

  const text = `
Password Changed Successfully

This is to confirm that your password has been changed successfully.

If you did not make this change, please contact our support team immediately.

For security reasons, you will need to log in again with your new password.
  `;

  return { html, text };
};
