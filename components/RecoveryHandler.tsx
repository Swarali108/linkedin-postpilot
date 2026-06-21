"use client";

import { useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

/**
 * Global handler for password-reset email links. The link can land on ANY page
 * (often the landing "/"), with the recovery token in the URL. Creating a client
 * here processes that token; when Supabase fires PASSWORD_RECOVERY we send the
 * user to /reset (where the new-password form lives). The recovery session is in
 * cookies by then, so /reset picks it up.
 */
export default function RecoveryHandler() {
  useEffect(() => {
    const supabase = createBrowserSupabase();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === "PASSWORD_RECOVERY" &&
        window.location.pathname !== "/reset"
      ) {
        window.location.assign("/reset");
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return null;
}
