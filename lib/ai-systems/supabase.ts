import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { DemoLead } from "./types";

/**
 * Service-role client for demo_leads only. Same project as agreements, but
 * this helper is never imported from /api/contact or /api/agreement.
 * RLS on demo_leads denies anon/authenticated; this key bypasses RLS.
 */
export function demoLeadsClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured (SUPABASE_URL / SUPABASE_SECRET_KEY)");
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

export async function getDemoLeadById(id: string): Promise<DemoLead | null> {
  const { data, error } = await demoLeadsClient()
    .from("demo_leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as DemoLead | null) ?? null;
}

export async function getDemoLeadByWatchToken(
  token: string
): Promise<DemoLead | null> {
  const { data, error } = await demoLeadsClient()
    .from("demo_leads")
    .select("*")
    .eq("watch_token", token)
    .maybeSingle();
  if (error) throw error;
  return (data as DemoLead | null) ?? null;
}

export async function listDemoLeads(limit = 100): Promise<DemoLead[]> {
  const { data, error } = await demoLeadsClient()
    .from("demo_leads")
    .select("*")
    .order("submitted_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as DemoLead[]) ?? [];
}
