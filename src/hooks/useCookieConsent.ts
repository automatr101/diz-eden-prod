import { useCallback, useEffect, useState } from "react";

export type ConsentStatus = "accepted" | "declined" | null;

export const COOKIE_CONSENT_STORAGE_KEY = "diz_eden_cookie_consent";
const STORAGE_KEY = COOKIE_CONSENT_STORAGE_KEY;

export function useCookieConsent() {
  const [status, setStatus] = useState<ConsentStatus>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "accepted" || stored === "declined") {
      setStatus(stored);
    }
    setLoaded(true);
  }, []);

  const accept = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setStatus("accepted");
  }, []);

  const decline = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setStatus("declined");
  }, []);

  return { status, loaded, accept, decline };
}
