const GA_MEASUREMENT_ID = "G-FYMR4XZNQL";
const UTM_STORAGE_KEY = "diz_eden_utm";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

/**
 * Captures UTM params from the current URL into sessionStorage so they
 * survive client-side route changes (the SPA loses query params the moment
 * the user navigates away from the landing URL). Safe to call unconditionally
 * — this only reads the URL and writes to sessionStorage, it never sends
 * anything over the network, so it doesn't require cookie consent.
 */
export function captureUtmParams() {
  const search = new URLSearchParams(window.location.search);
  const found: UtmParams = {};
  let hasAny = false;

  for (const key of UTM_KEYS) {
    const value = search.get(key);
    if (value) {
      found[key] = value;
      hasAny = true;
    }
  }

  if (hasAny) {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(found));
  }
}

function getStoredUtmParams(): UtmParams {
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

let analyticsLoaded = false;

/**
 * Dynamically injects gtag.js and initializes GA — only call this after the
 * user has accepted cookie consent. Attributes the session to any captured
 * UTM params even if consent was given after the user navigated away from
 * the original landing URL.
 */
export function loadAnalytics() {
  if (analyticsLoaded || typeof window === "undefined") return;
  analyticsLoaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());

  const utm = getStoredUtmParams();
  window.gtag("config", GA_MEASUREMENT_ID, {
    campaign_source: utm.utm_source,
    campaign_medium: utm.utm_medium,
    campaign_name: utm.utm_campaign,
    campaign_term: utm.utm_term,
    campaign_content: utm.utm_content,
  });
}

export function isAnalyticsLoaded() {
  return analyticsLoaded;
}

/** Fires a virtual pageview for client-side route changes (React Router doesn't reload the page, so gtag's automatic pageview only fires once for the whole session otherwise). */
export function trackPageview(path: string) {
  if (!analyticsLoaded || typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
