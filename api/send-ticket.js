
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const { email, eventName, ticketId } = req.body || {};

  if (
    typeof email !== "string" ||
    !email.includes("@") ||
    typeof eventName !== "string" ||
    typeof ticketId !== "string"
  ) {
    return res.status(400).json({
      error: "Valid email, event name, and ticket ID are required"
    });
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "Email service is not configured"
    });
  }

  try {
    const response = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "STARGATES <onboarding@resend.dev>",
          to: [email],
          subject: `Your ticket for ${eventName}`,
          text: `Thanks for your interest in ${eventName}!\n\nTicket reference: ${ticketId}\n\nKeep this reference for your records.\n\nIMPORTANT: This email is not proof of payment or event admission until your purchase is confirmed.`
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend error:", result);
      return res.status(502).json({
        error: "Could not send email"
      });
    }

    return res.status(200).json({
      message: "Email sent",
      id: result.id
    });
  } catch (error) {
    console.error("Email request failed:", error);
    return res.status(500).json({
      error: "Email service failed"
    });
  }
}
