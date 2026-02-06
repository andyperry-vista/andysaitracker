import { useParams, useNavigate } from "react-router-dom";
import { useAccounts, usePipelineStages, useUpdateAccount } from "@/hooks/useAccounts";
import { useTasks, useUpdateTask } from "@/hooks/useTasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { HealthBadge } from "@/components/HealthBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Mail, Phone, Globe, Building2, Calendar, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: accounts = [] } = useAccounts();
  const { data: stages = [] } = usePipelineStages();
  const { data: tasks = [] } = useTasks();
  const updateAccount = useUpdateAccount();
  const updateTask = useUpdateTask();

  const account = accounts.find(a => a.id === id);
  const accountTasks = tasks.filter(t => t.account_id === id);
  const doneTasks = accountTasks.filter(t => t.status === "done");
  const pendingTasks = accountTasks.filter(t => t.status !== "done");

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

  const toggleTaskDone = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "todo" : "done";
    try {
      await updateTask.mutateAsync({ id: taskId, status: newStatus as any });
      toast.success(newStatus === "done" ? "Task completed! 🎉" : "Task reopened");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const priorityColor: Record<string, string> = {
    low: "bg-status-healthy/15 text-status-healthy border-status-healthy/30",
    medium: "bg-status-warning/15 text-status-warning border-status-warning/30",
    high: "bg-priority-high/15 text-priority-high border-priority-high/30",
    urgent: "bg-status-danger/15 text-status-danger border-status-danger/30",
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
        {accountTasks.length > 0 && (
          <div className="text-right">
            <p className="text-2xl font-bold font-display text-primary">{doneTasks.length}/{accountTasks.length}</p>
            <p className="text-[10px] text-muted-foreground">tasks done</p>
          </div>
        )}
      </div>

      {/* Pipeline progress */}
      <Card className="border-0 shadow-md overflow-hidden">
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
                  className={`flex-1 h-2.5 rounded-full transition-all ${isActive ? "ring-2 ring-offset-1" : ""}`}
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
        <Card className="border-0 shadow-md">
          <CardHeader><CardTitle className="text-base font-display">Contact Info</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Building2, value: account.contact_name },
              { icon: Mail, value: account.contact_email },
              { icon: Phone, value: account.contact_phone },
              { icon: Globe, value: account.website },
              { icon: Calendar, value: account.last_touched_at ? `Last touched: ${format(parseISO(account.last_touched_at), "MMM d, yyyy")}` : null },
            ].map(({ icon: Icon, value }, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{value || "—"}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Health score */}
        <Card className="border-0 shadow-md">
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

        {/* Tasks as interactive checklist */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              Tasks ({accountTasks.length})
              {accountTasks.length > 0 && (
                <Badge variant="outline" className="ml-auto text-[10px] text-status-healthy border-status-healthy/30">
                  {doneTasks.length} completed
                </Badge>
              )}
            </CardTitle>
            {accountTasks.length > 0 && (
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden mt-2">
                <div
                  className="h-full rounded-full bg-status-healthy transition-all duration-500"
                  style={{ width: `${(doneTasks.length / accountTasks.length) * 100}%` }}
                />
              </div>
            )}
          </CardHeader>
          <CardContent>
            {accountTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks linked to this account.</p>
            ) : (
              <div className="space-y-2">
                {/* Pending tasks */}
                {pendingTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => toggleTaskDone(task.id, task.status)}
                  >
                    <Checkbox checked={false} className="h-5 w-5 rounded-full border-2 group-hover:border-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-[10px] text-muted-foreground">{task.due_date ? `Due ${format(new Date(task.due_date), "MMM d")}` : "No due date"}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${priorityColor[task.priority]}`}>{task.priority}</Badge>
                    <Badge variant="outline" className="text-[10px]">{task.status}</Badge>
                  </div>
                ))}
                {/* Completed tasks */}
                {doneTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-lg border border-status-healthy/20 bg-status-healthy/5 p-3 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                    onClick={() => toggleTaskDone(task.id, task.status)}
                  >
                    <CheckCircle2 className="h-5 w-5 text-status-healthy shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-through text-muted-foreground">{task.title}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-status-healthy border-status-healthy/30">done</Badge>
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
