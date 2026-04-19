import { supabase } from "@/integrations/supabase/client";

export const emailApi = {
  sendConfirmation: async (details: {
    to: string;
    name: string;
    bookingRef: string;
    checkIn: string;
    checkOut: string;
    propertyName?: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          action: "confirmation",
          ...details,
        },
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Failed to send confirmation email:", err);
      return false;
    }
  },

  sendCancellation: async (details: {
    to: string;
    name: string;
    bookingRef: string;
    propertyName?: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          action: "cancellation",
          ...details,
        },
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Failed to send cancellation email:", err);
      return false;
    }
  },
};
