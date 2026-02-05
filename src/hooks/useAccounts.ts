import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Account {
  id: string;
  user_id: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  pipeline_stage_id: string | null;
  health_score: number | null;
  last_touched_at: string | null;
  notes: string | null;
  industry: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  user_id: string;
  name: string;
  display_order: number;
  color: string | null;
  created_at: string;
}

export function usePipelineStages() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["pipeline_stages", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipeline_stages")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as PipelineStage[];
    },
    enabled: !!user,
  });
}

export function useAccounts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["accounts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("company_name");
      if (error) throw error;
      return data as Account[];
    },
    enabled: !!user,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (account: Partial<Account>) => {
      const { data, error } = await supabase
        .from("accounts")
        .insert([{ ...account, user_id: user!.id } as any])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Account> & { id: string }) => {
      const { data, error } = await supabase
        .from("accounts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}
