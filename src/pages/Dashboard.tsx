import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAccounts, usePipelineStages } from "@/hooks/useAccounts";
import { useTasks } from "@/hooks/useTasks";
import { HealthBadge } from "@/components/HealthBadge";
import { Building2, CheckSquare, AlertTriangle, TrendingUp, ListChecks, Clock } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { data: accounts = [] } = useAccounts();
  const { data: stages = [] } = usePipelineStages();
  const { data: tasks = [] } = useTasks();
  const navigate = useNavigate();

  const staleThreshold = 14;
  const staleAccounts = accounts.filter(a =>
    a.last_touched_at && differenceInDays(new Date(), parseISO(a.last_touched_at)) > staleThreshold
  );
  const overdueTasks = tasks.filter(t => t.due_date && t.status !== "done" && new Date(t.due_date) < new Date());
  const activeTasks = tasks.filter(t => t.status !== "done");
  const completedTasks = tasks.filter(t => t.status === "done");

  const healthyAccounts = accounts.filter(a => (a.health_score ?? 50) >= 70);
  const weakAccounts = accounts.filter(a => (a.health_score ?? 50) >= 40 && (a.health_score ?? 50) < 70);
  const criticalAccounts = accounts.filter(a => (a.health_score ?? 50) < 40);

  const stageDistribution = stages.map(stage => ({
    ...stage,
    count: accounts.filter(a => a.pipeline_stage_id === stage.id).length,
  }));

  const statCards = [
    { label: "Total Accounts", value: accounts.length, icon: Building2, gradient: "from-primary to-accent-foreground", iconBg: "bg-primary/15 text-primary" },
    { label: "Need Attention", value: staleAccounts.length, icon: AlertTriangle, gradient: "from-status-warning to-priority-high", iconBg: "bg-status-warning/15 text-status-warning" },
    { label: "Active Tasks", value: activeTasks.length, icon: ListChecks, gradient: "from-status-info to-primary", iconBg: "bg-status-info/15 text-status-info" },
    { label: "Completed", value: completedTasks.length, icon: TrendingUp, gradient: "from-status-healthy to-[hsl(170,60%,45%)]", iconBg: "bg-status-healthy/15 text-status-healthy" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your account health at a glance</p>
      </div>

      {/* Colorful summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, gradient, iconBg }) => (
          <Card key={label} className="relative overflow-hidden border-0 shadow-md">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.07]`} />
            <CardContent className="relative flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold font-display">{value}</p>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Health breakdown - inspired by Customer 360 */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-display">Health Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Healthy", count: healthyAccounts.length, colorClass: "bg-status-healthy text-status-healthy" },
              { label: "Weak", count: weakAccounts.length, colorClass: "bg-status-warning text-status-warning" },
              { label: "Critical", count: criticalAccounts.length, colorClass: "bg-status-danger text-status-danger" },
            ].map(({ label, count, colorClass }) => (
              <div key={label} className={`flex items-center justify-between rounded-lg px-4 py-3 ${colorClass.split(" ")[0]}/10`}>
                <span className={`font-semibold ${colorClass.split(" ")[1]}`}>{label}</span>
                <span className={`text-2xl font-bold font-display ${colorClass.split(" ")[1]}`}>{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pipeline distribution with colored progress bars */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-display">Pipeline Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {stageDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pipeline stages configured yet.</p>
            ) : (
              <div className="space-y-4">
                {stageDistribution.map(stage => (
                  <div key={stage.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: stage.color || "hsl(var(--primary))" }} />
                        <span className="font-medium">{stage.name}</span>
                      </div>
                      <span className="text-muted-foreground font-display font-semibold">
                        {stage.count}/{accounts.length}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${accounts.length > 0 ? (stage.count / accounts.length) * 100 : 0}%`,
                          backgroundColor: stage.color || "hsl(var(--primary))",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stale accounts */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-status-warning" /> Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {staleAccounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">All accounts are up to date! 🎉</p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {staleAccounts.slice(0, 8).map(account => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between rounded-lg border border-status-warning/20 bg-status-warning/5 p-3 cursor-pointer hover:bg-status-warning/10 transition-colors"
                    onClick={() => navigate(`/accounts/${account.id}`)}
                  >
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

        {/* Overdue tasks with checklist style */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Clock className="h-4 w-4 text-status-danger" /> Overdue Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No overdue tasks! 🎉</p>
            ) : (
              <div className="space-y-2">
                {overdueTasks.slice(0, 6).map(task => (
                  <div key={task.id} className="flex items-center gap-3 rounded-lg border border-status-danger/20 bg-status-danger/5 p-3">
                    <div className="h-5 w-5 rounded border-2 border-status-danger/40 flex items-center justify-center shrink-0">
                      <CheckSquare className="h-3 w-3 text-status-danger/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">{task.title}</span>
                      <span className="text-[10px] text-muted-foreground">
                        Due {task.due_date ? format(new Date(task.due_date), "MMM d") : "—"}
                      </span>
                    </div>
                    <Badge
                      className="text-[10px] shrink-0"
                      variant={task.priority === "urgent" ? "destructive" : "outline"}
                    >
                      {task.priority}
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
