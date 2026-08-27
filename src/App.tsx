import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Booking from "./pages/Booking";
import BookingConfirmation from "./pages/BookingConfirmation";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/admin/AdminPage";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cancellation from "./pages/Cancellation";
import { Chatbot } from "@/components/Chatbot";
import { SkipToContent } from "@/components/ui/skip-to-content";
import { BackToTop } from "@/components/ui/back-to-top";
import { ScrollProgressBar } from "@/components/ui/scroll-progress-bar";
import { CookieConsentBanner } from "@/components/ui/cookie-consent-banner";
import { captureUtmParams, loadAnalytics, trackPageview, isAnalyticsLoaded } from "@/lib/analytics";
import { COOKIE_CONSENT_STORAGE_KEY } from "@/hooks/useCookieConsent";

const queryClient = new QueryClient();

/** Fires a virtual pageview on every client-side route change, once analytics is loaded. */
function AnalyticsRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    if (isAnalyticsLoaded()) {
      trackPageview(location.pathname);
    }
  }, [location.pathname]);

  return null;
}

const App = () => {
  useEffect(() => {
    captureUtmParams();
    if (localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) === "accepted") {
      loadAnalytics();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SkipToContent />
        <ScrollProgressBar />
        <Sonner />
        <BrowserRouter>
          <AnalyticsRouteTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<PropertyDetail />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking/confirmation" element={<BookingConfirmation />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cancellation" element={<Cancellation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsentBanner />
        </BrowserRouter>
        <Chatbot />
        <BackToTop />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
