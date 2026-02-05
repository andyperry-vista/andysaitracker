import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccounts, usePipelineStages } from "@/hooks/useAccounts";
import { useTasks } from "@/hooks/useTasks";
import { HealthBadge } from "@/components/HealthBadge";
import { ProgressRing } from "@/components/ProgressRing";
import { Building2, CheckSquare, AlertTriangle, TrendingUp } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

export default function Dashboard() {
  const { data: accounts = [] } = useAccounts();
  const { data: stages = [] } = usePipelineStages();
  const { data: tasks = [] } = useTasks();

  const staleThreshold = 14;
  const staleAccounts = accounts.filter(a =>
    a.last_touched_at && differenceInDays(new Date(), parseISO(a.last_touched_at)) > staleThreshold
  );
  const overdueTasks = tasks.filter(t => t.due_date && t.status !== "done" && new Date(t.due_date) < new Date());
  const activeTasks = tasks.filter(t => t.status !== "done");
  const completedTasks = tasks.filter(t => t.status === "done");

  const stageDistribution = stages.map(stage => ({
    ...stage,
    count: accounts.filter(a => a.pipeline_stage_id === stage.id).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your account health at a glance</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{accounts.length}</p>
              <p className="text-xs text-muted-foreground">Total Accounts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-warning/10">
              <AlertTriangle className="h-5 w-5 text-status-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{staleAccounts.length}</p>
              <p className="text-xs text-muted-foreground">Need Attention</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-info/10">
              <CheckSquare className="h-5 w-5 text-status-info" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{activeTasks.length}</p>
              <p className="text-xs text-muted-foreground">Active Tasks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-healthy/10">
              <TrendingUp className="h-5 w-5 text-status-healthy" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{completedTasks.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pipeline distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">Pipeline Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {stageDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pipeline stages configured yet.</p>
            ) : (
              <div className="flex flex-wrap items-end gap-6">
                {stageDistribution.map(stage => (
                  <div key={stage.id} className="relative flex flex-col items-center">
                    <ProgressRing
                      value={stage.count}
                      max={Math.max(accounts.length, 1)}
                      size={64}
                      strokeWidth={5}
                      color={stage.color || "hsl(var(--primary))"}
                    />
                    <span className="mt-1 text-[11px] text-muted-foreground">{stage.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stale accounts warning */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">⚠️ Needs Attention</CardTitle>
          </CardHeader>
          <CardContent>
            {staleAccounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">All accounts are up to date! 🎉</p>
            ) : (
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {staleAccounts.slice(0, 8).map(account => (
                  <div key={account.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HealthBadge score={account.health_score ?? 50} size="sm" />
                      <span className="text-sm font-medium">{account.company_name}</span>
                    </div>
                    <Badge variant="outline" className="text-status-warning border-status-warning/30 text-[10px]">
                      {differenceInDays(new Date(), parseISO(account.last_touched_at!))}d ago
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue tasks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-display">🔴 Overdue Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {overdueTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No overdue tasks! 🎉</p>
            ) : (
              <div className="space-y-2">
                {overdueTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center justify-between rounded-md border p-3">
                    <span className="text-sm font-medium">{task.title}</span>
                    <Badge variant="destructive" className="text-[10px]">
                      Due {task.due_date}
                    </Badge>
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
