import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const EDGE_FUNCTION_URL = `${supabaseUrl}/functions/v1/donate`;

export async function callEdgeFunction(action: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${EDGE_FUNCTION_URL}?action=${action}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
      ...options.headers,
    },
  });
}
