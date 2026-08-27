import { useEffect } from "react";

interface DocumentMetaOptions {
  title: string;
  description?: string;
  path?: string;
  noindex?: boolean;
}

const SITE_URL = "https://dizeden.com";

function setMetaTag(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Sets the document title, meta description, canonical URL, and Open Graph /
 * Twitter tags for the current route. index.html only ships homepage defaults,
 * so every routed page must call this to get correct per-page SEO metadata.
 */
export function useDocumentMeta({ title, description, path = "/", noindex = false }: DocumentMetaOptions) {
  useEffect(() => {
    document.title = title;
    if (description) {
      setMetaTag("name", "description", description);
      setMetaTag("property", "og:description", description);
      setMetaTag("name", "twitter:description", description);
    }
    setMetaTag("property", "og:title", title);
    setMetaTag("name", "twitter:title", title);
    setMetaTag("name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    const canonicalUrl = `${SITE_URL}${path}`;
    setCanonical(canonicalUrl);
    setMetaTag("property", "og:url", canonicalUrl);
    setMetaTag("name", "twitter:url", canonicalUrl);
  }, [title, description, path, noindex]);
}
