export const DEMO_SERVICE_TYPES = [
  "Roofing",
  "HVAC",
  "Solar",
  "General Contractor",
  "Other",
] as const;

export type DemoServiceType = (typeof DEMO_SERVICE_TYPES)[number];

export const DEMO_CALL_STATUSES = [
  "pending",
  "qualifying",
  "dialing",
  "ringing",
  "answered",
  "no_answer",
  "voicemail",
  "busy",
  "sms_sent",
  "booked",
  "failed",
  "consent_declined",
] as const;

export type DemoCallStatus = (typeof DEMO_CALL_STATUSES)[number];

export type RecordingConsent = "granted" | "declined" | "unknown";
export type ContactChannel = "voice" | "sms" | "none";

export interface DemoLead {
  id: string;
  name: string;
  phone: string;
  service_type: string;
  description: string;
  submitted_at: string;
  first_contact_at: string | null;
  response_time_seconds: number | null;
  call_status: DemoCallStatus;
  booked: boolean;
  booked_at: string | null;
  qualification_score: number | null;
  qualification_summary: string | null;
  qualification_urgency: string | null;
  contact_channel: ContactChannel | null;
  vapi_call_id: string | null;
  cal_com_booking_uid: string | null;
  sms_sent_at: string | null;
  recording_consent: RecordingConsent | null;
  watch_token: string;
  n8n_fired_at: string | null;
  n8n_error: string | null;
  created_at: string;
  updated_at: string;
}

/** Public poll payload — no phone, token, or internals. */
export interface DemoLeadWatch {
  id: string;
  name: string;
  call_status: DemoCallStatus;
  booked: boolean;
  response_time_seconds: number | null;
  contact_channel: ContactChannel | null;
  submitted_at: string;
}

export const DEMO_LEAD_PATCH_FIELDS = [
  "first_contact_at",
  "response_time_seconds",
  "call_status",
  "booked",
  "booked_at",
  "qualification_score",
  "qualification_summary",
  "qualification_urgency",
  "contact_channel",
  "vapi_call_id",
  "cal_com_booking_uid",
  "sms_sent_at",
  "recording_consent",
  "n8n_fired_at",
  "n8n_error",
  "updated_at",
] as const;

export type DemoLeadPatch = Partial<
  Pick<DemoLead, (typeof DEMO_LEAD_PATCH_FIELDS)[number]>
>;
