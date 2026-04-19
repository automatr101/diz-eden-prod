import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
