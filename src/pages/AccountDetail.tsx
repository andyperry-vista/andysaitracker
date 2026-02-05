import { useParams, useNavigate } from "react-router-dom";
import { useAccounts, usePipelineStages, useUpdateAccount } from "@/hooks/useAccounts";
import { useTasks } from "@/hooks/useTasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HealthBadge } from "@/components/HealthBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Mail, Phone, Globe, Building2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: accounts = [] } = useAccounts();
  const { data: stages = [] } = usePipelineStages();
  const { data: tasks = [] } = useTasks();
  const updateAccount = useUpdateAccount();

  const account = accounts.find(a => a.id === id);
  const accountTasks = tasks.filter(t => t.account_id === id);

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Account not found</p>
        <Button variant="ghost" onClick={() => navigate("/accounts")} className="mt-2">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Accounts
        </Button>
      </div>
    );
  }

  const currentStage = stages.find(s => s.id === account.pipeline_stage_id);

  const handleStageChange = async (stageId: string) => {
    try {
      await updateAccount.mutateAsync({ id: account.id, pipeline_stage_id: stageId, last_touched_at: new Date().toISOString() });
      toast.success("Stage updated");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleHealthChange = async (value: number[]) => {
    await updateAccount.mutateAsync({ id: account.id, health_score: value[0] });
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/accounts")} className="mb-2">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </Button>

      {/* Header */}
      <div className="flex items-start gap-4">
        <HealthBadge score={account.health_score ?? 50} size="md" />
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">{account.company_name}</h1>
          <p className="text-sm text-muted-foreground">{account.industry || "No industry"}</p>
        </div>
      </div>

      {/* Pipeline progress */}
      <Card>
        <CardHeader><CardTitle className="text-base font-display">Pipeline Stage</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-1 mb-4">
            {stages.map((stage, i) => {
              const isActive = stage.id === account.pipeline_stage_id;
              const isPast = stages.findIndex(s => s.id === account.pipeline_stage_id) > i;
              return (
                <button
                  key={stage.id}
                  onClick={() => handleStageChange(stage.id)}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    isActive ? "ring-2 ring-offset-1" : ""
                  }`}
                  style={{
                    backgroundColor: isActive || isPast ? (stage.color || "#6366f1") : "hsl(var(--muted))",
                    ...(isActive ? { outlineColor: stage.color || "#6366f1" } : {}),
                  }}
                  title={stage.name}
                />
              );
            })}
          </div>
          <Select value={account.pipeline_stage_id || ""} onValueChange={handleStageChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {stages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact info */}
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Contact Info</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{account.contact_name || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{account.contact_email || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{account.contact_phone || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>{account.website || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Last touched: {account.last_touched_at ? format(parseISO(account.last_touched_at), "MMM d, yyyy") : "—"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Health score */}
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Health Score</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Adjust account health</span>
              <HealthBadge score={account.health_score ?? 50} />
            </div>
            <Slider
              value={[account.health_score ?? 50]}
              onValueCommit={handleHealthChange}
              max={100}
              step={5}
            />
          </CardContent>
        </Card>

        {/* Related tasks */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base font-display">Tasks ({accountTasks.length})</CardTitle></CardHeader>
          <CardContent>
            {accountTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks linked to this account.</p>
            ) : (
              <div className="space-y-2">
                {accountTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.due_date || "No due date"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px]">{task.status}</Badge>
                      <Badge variant="outline" className="text-[10px]">{task.priority}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
