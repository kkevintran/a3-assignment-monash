/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import sgMail from "@sendgrid/mail";
import * as dotenv from "dotenv";
dotenv.config();
// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
setGlobalOptions({maxInstances: 10});

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

if (SENDGRID_API_KEY && FROM_EMAIL) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  logger.warn(
    "SendGrid API key or FROM_EMAIL not set. Email functions will not work."
  );
}

export const helloWorld = onCall(async () => {
  logger.info("Hello logs!", {structuredData: true});
  return {message: "Hello from Firebase!"};
});

// SendGrid email function
interface SendEmailRequest {
  to: string;
  from: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = onCall(async (request) => {
  // Check if SendGrid is configured
  if (!SENDGRID_API_KEY || !FROM_EMAIL) {
    logger.error(
      "SendGrid not configured. Missing SENDGRID_API_KEY or " +
      "SENDGRID_FROM_EMAIL"
    );
    throw new HttpsError(
      "failed-precondition",
      "Email service not configured"
    );
  }

  // Validate request data exists
  if (!request.data) {
    throw new HttpsError("invalid-argument", "Request data is missing");
  }

  const {to, from, subject, text, html} = request.data as SendEmailRequest;

  // Validate required fields
  if (!to || !from || !subject || (!text && !html)) {
    throw new HttpsError(
      "invalid-argument",
      "Missing required fields: to, from, subject, and at least one of " +
      "text or html"
    );
  }

  try {
    await sgMail.send({
      to, // recipient email
      from, // sender email
      subject,
      text, // email body
      html: html || text, // email body in HTML format
    });

    logger.info("Email sent successfully", {to, subject});
    return {success: true};
  } catch (error: unknown) {
    logger.error("SendGrid error:", error);

    const sgError =
      (error as {response?: {body?: {errors?: unknown}}})?.response
        ?.body?.errors ?? null;

    throw new HttpsError(
      "internal",
      `Failed to send email: ${JSON.stringify(sgError || error)}`
    );
  }
});
