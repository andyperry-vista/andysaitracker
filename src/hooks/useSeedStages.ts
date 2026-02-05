import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { usePipelineStages } from "./useAccounts";
import { useQueryClient } from "@tanstack/react-query";

const DEFAULT_STAGES = [
  { name: "Qualify", display_order: 0, color: "#6366f1" },
  { name: "Develop", display_order: 1, color: "#f59e0b" },
  { name: "Propose", display_order: 2, color: "#3b82f6" },
  { name: "Negotiate", display_order: 3, color: "#8b5cf6" },
  { name: "Close", display_order: 4, color: "#22c55e" },
];

export function useSeedStages() {
  const { user } = useAuth();
  const { data: stages } = usePipelineStages();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user || !stages || stages.length > 0) return;

    const seed = async () => {
      await supabase.from("pipeline_stages").insert(
        DEFAULT_STAGES.map(s => ({ ...s, user_id: user.id }))
      );
      qc.invalidateQueries({ queryKey: ["pipeline_stages"] });
    };
    seed();
  }, [user, stages, qc]);
}
