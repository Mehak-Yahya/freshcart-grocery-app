import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();

  if (!user || !pass) {
    throw new Error("Email credentials not configured in .env");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"FreshCart" <${user}>`,
    to,
    subject,
    html,
  });
};