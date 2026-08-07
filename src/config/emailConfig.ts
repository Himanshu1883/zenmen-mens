export const emailConfig = {
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  mailFrom:
    process.env.MAIL_FROM ?? "ZENmen <noreply@zenmen.in>",
  mailReplyTo: process.env.MAIL_REPLY_TO ?? "support@zenmen.in",
  adminOrderEmail: process.env.ADMIN_ORDER_EMAIL ?? "orders@zenmen.in",
  logoUrl:
    process.env.EMAIL_LOGO_URL ??
    `${process.env.NEXTAUTH_URL ?? "https://zenmen.in"}/logo_zenmen.png`,
  clientUrl: process.env.NEXTAUTH_URL ?? "https://zenmen.in",
};

export function isEmailConfigured(): boolean {
  return Boolean(emailConfig.resendApiKey?.trim());
}
