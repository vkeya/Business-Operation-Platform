import { Resend } from "resend";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult = {
  id: string;
};

export async function sendEmail(
  input: SendEmailInput
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  if (!from) {
    throw new Error(
      "EMAIL_FROM is not configured."
    );
  }

  const resend = new Resend(apiKey);

  const { data, error } =
    await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

  if (error) {
    throw new Error(
      `Email delivery failed: ${error.message}`
    );
  }

  if (!data?.id) {
    throw new Error(
      "Email provider did not return an email ID."
    );
  }

  return {
    id: data.id,
  };
}