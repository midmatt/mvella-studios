/**
 * Cal.com v2 booking for Speed-to-Lead demos. Called from the Vapi
 * end-of-call webhook when the assistant extracted a slot — not from the
 * public form, and not from the production contact pipeline.
 */

export function calComBookingUrl(): string {
  return (
    process.env.CAL_COM_BOOKING_URL ??
    process.env.NEXT_PUBLIC_CAL_COM_BOOKING_URL ??
    "https://cal.com"
  );
}

export function isCalComConfigured(): boolean {
  return Boolean(process.env.CALCOM_API_KEY && process.env.CALCOM_EVENT_TYPE_ID);
}

export async function createCalComBooking(input: {
  startIso: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}): Promise<{ uid: string } | { error: string }> {
  const apiKey = process.env.CALCOM_API_KEY;
  const eventTypeId = Number(process.env.CALCOM_EVENT_TYPE_ID);
  if (!apiKey || !Number.isFinite(eventTypeId)) {
    return { error: "Cal.com is not configured" };
  }

  const response = await fetch("https://api.cal.com/v2/bookings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "cal-api-version": "2024-08-13",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventTypeId,
      start: input.startIso,
      attendee: {
        name: input.name,
        email: input.email,
        timeZone: "America/New_York",
        language: "en",
        phoneNumber: input.phone,
      },
      metadata: {
        source: "mvella-speed-to-lead-demo",
      },
      bookingFieldsResponses: {
        notes: input.notes,
      },
    }),
  });

  const payload = (await response.json().catch(() => null)) as {
    status?: string;
    data?: { uid?: string };
    error?: { message?: string };
    message?: string;
  } | null;

  if (!response.ok || !payload?.data?.uid) {
    const message =
      payload?.error?.message ??
      payload?.message ??
      `Cal.com booking failed (${response.status})`;
    return { error: message };
  }

  return { uid: payload.data.uid };
}
