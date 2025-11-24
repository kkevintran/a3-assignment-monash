import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";

dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;
const PORT = process.env.SERVER_PORT || 4000;

if (!SENDGRID_API_KEY || !FROM_EMAIL) {
  throw new Error("SENDGRID_API_KEY and SENDGRID_FROM_EMAIL must be set in .env");
}

sgMail.setApiKey(SENDGRID_API_KEY);

const app = express();

app.use(cors());
app.use(express.json());

interface SendEmailBody {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// POST /api/send-email
app.post(
  "/api/send-email",
  async (req: Request<{}, {}, SendEmailBody>, res: Response) => {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({
        error: "Missing required fields: to, subject, and at least one of text or html",
      });
    }

    try {
      await sgMail.send({
        to,
        from: FROM_EMAIL,
        subject,
        text,
        html,
      });

      return res.json({ success: true });
    } catch (error: any) {
      console.error("SendGrid error:", error);

      const sgError = error?.response?.body?.errors ?? null;

      return res.status(500).json({
        success: false,
        error: "Failed to send email",
        details: sgError,
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
