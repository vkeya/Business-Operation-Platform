import { NextRequest, NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email/emailService";
import { checkContactRateLimit } from "@/lib/security/contactRateLimit";

export const runtime = "nodejs";

const enquiryTypes = [
  "Request a product demo",
  "Discuss business requirements",
  "Ask about pricing",
  "Get onboarding assistance",
  "Other enquiry",
];

const businessTypes = [
  "Shop / Retail",
  "Supermarket",
  "Pharmacy",
  "Hospital",
  "Restaurant",
  "Boutique",
  "Wines & Spirits",
  "Other",
];

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function clean(value: unknown, maxLength: number): string {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(
      request.headers.get("content-length") || 0
    );

    if (contentLength > 15_000) {
      return NextResponse.json(
        { error: "Your submission is too large." },
        { status: 413 }
      );
    }

	const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");

    const ip = forwardedFor?.split(",")[0]?.trim() || realIp;

    if (!ip) {
      return Response.json(
        { success: false, error: "Unable to verify your request." },
        { status: 400 }
      );
    }

    const rateLimit = await checkContactRateLimit(ip);

    if (!rateLimit.success) {
      const retryAfter = Math.max(
        1,
        Math.ceil((rateLimit.reset - Date.now()) / 1000)
      );

      return Response.json(
        {
          success: false,
          error: "Too many enquiries. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    const body = await request.json();

    // Honeypot field: genuine visitors should leave this empty.
    if (clean(body.website, 200)) {
      return NextResponse.json({ success: true });
    }

    const fullName = clean(body.fullName, 120);
    const businessName = clean(body.businessName, 160);
    const email = clean(body.email, 254).toLowerCase();
    const phone = clean(body.phone, 30);
    const businessType = clean(body.businessType, 60);
    const enquiryType = clean(body.enquiryType, 80);
    const message = clean(body.message, 3000);

    if (
      !fullName ||
      !businessName ||
      !email ||
      !phone ||
      !businessType ||
      !enquiryType
    ) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!businessTypes.includes(businessType)) {
      return NextResponse.json(
        { error: "Please select a valid business type." },
        { status: 400 }
      );
    }

    if (!enquiryTypes.includes(enquiryType)) {
      return NextResponse.json(
        { error: "Please select a valid enquiry type." },
        { status: 400 }
      );
    }

    const recipient = process.env.CONTACT_EMAIL_TO;

    if (!recipient) {
      console.error("CONTACT_EMAIL_TO is not configured.");

      return NextResponse.json(
        { error: "Enquiries are temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    const safeName = escapeHtml(fullName);
    const safeBusiness = escapeHtml(businessName);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeBusinessType = escapeHtml(businessType);
    const safeEnquiryType = escapeHtml(enquiryType);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

    const submittedAt = new Date().toISOString();

    await sendTransactionalEmail({
      to: recipient,
      subject: `New SmatPic enquiry: ${enquiryType}`,
      text: [
        "New SmatPic website enquiry",
        "",
        `Name: ${fullName}`,
        `Business: ${businessName}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Business type: ${businessType}`,
        `Enquiry: ${enquiryType}`,
        `Message: ${message || "No additional message"}`,
        `Submitted: ${submittedAt}`,
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;color:#0f172a;max-width:650px;margin:auto">
          <h2 style="color:#6d28d9">New SmatPic Website Enquiry</h2>
          <p>A prospective customer has submitted an enquiry.</p>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0"><strong>Name</strong></td><td style="padding:10px;border-bottom:1px solid #e2e8f0">${safeName}</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0"><strong>Business</strong></td><td style="padding:10px;border-bottom:1px solid #e2e8f0">${safeBusiness}</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0"><strong>Email</strong></td><td style="padding:10px;border-bottom:1px solid #e2e8f0">${safeEmail}</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0"><strong>Phone</strong></td><td style="padding:10px;border-bottom:1px solid #e2e8f0">${safePhone}</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0"><strong>Business type</strong></td><td style="padding:10px;border-bottom:1px solid #e2e8f0">${safeBusinessType}</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0"><strong>Enquiry</strong></td><td style="padding:10px;border-bottom:1px solid #e2e8f0">${safeEnquiryType}</td></tr>
          </table>
          <h3>Message</h3>
          <p style="line-height:1.7">${safeMessage || "No additional message provided."}</p>
          <p style="color:#64748b;font-size:12px">Submitted: ${submittedAt}</p>
        </div>
      `,
    });

    // The team notification is the primary delivery.
    // A customer acknowledgement is helpful but should not undo
    // a successfully delivered enquiry if acknowledgement fails.
    try {
      await sendTransactionalEmail({
        to: email,
        subject: "We received your enquiry | SmatPic",
        text: [
          `Hello ${fullName},`,
          "",
          "Thank you for contacting SmatPic.",
          "We have received your enquiry and our team will review it and get back to you.",
          "",
          "The SmatPic Team",
        ].join("\n"),
        html: `
          <div style="font-family:Arial,sans-serif;color:#0f172a;max-width:600px;margin:auto">
            <h2 style="color:#6d28d9">Thank you for contacting SmatPic.</h2>
            <p>Hello ${safeName},</p>
            <p>We have received your enquiry regarding <strong>${safeEnquiryType}</strong>.</p>
            <p>Our team will review your message and get back to you.</p>
            <p style="margin-top:32px">Regards,<br /><strong>The SmatPic Team</strong></p>
          </div>
        `,
      });
    } catch (acknowledgementError) {
      console.error(
        "Customer acknowledgement email failed:",
        acknowledgementError
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your enquiry has been submitted successfully.",
    });
  } catch (error) {
    console.error("Contact enquiry submission failed:", error);

    return NextResponse.json(
      { error: "We could not submit your enquiry. Please try again." },
      { status: 500 }
    );
  }
}