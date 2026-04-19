import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

export function useCreateBooking() {
  return useMutation({
    mutationFn: async (booking: TablesInsert<"bookings">) => {
      const { data, error } = await supabase
        .from("bookings")
        .insert(booking)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  });
}
