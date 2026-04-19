import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { parseISO } from "date-fns";

export function useAvailability() {
  return useQuery({
    queryKey: ["availability"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      // Fetch confirmed bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("check_in, check_out")
        .in("status", ["pending", "confirmed"]);

      // Fetch blocked dates
      const { data: blocked } = await supabase
        .from("blocked_dates")
        .select("date");

      const unavailable: Date[] = [];

      // Add all dates in booked ranges
      bookings?.forEach((b) => {
        const start = parseISO(b.check_in);
        const end = parseISO(b.check_out);
        const current = new Date(start);
        while (current < end) {
          unavailable.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
      });

      // Add blocked dates
      blocked?.forEach((b) => {
        unavailable.push(parseISO(b.date));
      });

      return unavailable;
    },
  });
}
