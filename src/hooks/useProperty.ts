import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePropertyBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["property", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("slug", slug!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("base_price", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
