import {
  sendEmail,
  type SendEmailInput,
  type SendEmailResult,
} from "./providers/resendProvider";

export async function sendTransactionalEmail(
  input: SendEmailInput
): Promise<SendEmailResult> {
  return sendEmail(input);
}