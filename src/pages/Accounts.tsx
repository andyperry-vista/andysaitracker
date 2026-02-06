import { useState } from "react";
import { useAccounts, usePipelineStages, useCreateAccount } from "@/hooks/useAccounts";
import { useTasks } from "@/hooks/useTasks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HealthBadge } from "@/components/HealthBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Accounts() {
  const { data: accounts = [], isLoading } = useAccounts();
  const { data: stages = [] } = usePipelineStages();
  const { data: tasks = [] } = useTasks();
  const createAccount = useCreateAccount();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStage, setNewStage] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = accounts.filter(a => {
    const matchesSearch = a.company_name.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === "all" || a.pipeline_stage_id === stageFilter;
    return matchesSearch && matchesStage;
  });

  const getStageName = (id: string | null) => stages.find(s => s.id === id)?.name ?? "—";
  const getStageColor = (id: string | null) => stages.find(s => s.id === id)?.color ?? "#6366f1";
  const getAccountTasks = (accountId: string) => tasks.filter(t => t.account_id === accountId);
  const getCompletedRatio = (accountId: string) => {
    const at = getAccountTasks(accountId);
    if (at.length === 0) return { done: 0, total: 0 };
    return { done: at.filter(t => t.status === "done").length, total: at.length };
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createAccount.mutateAsync({ company_name: newName, pipeline_stage_id: newStage || null });
      toast.success("Account created");
      setNewName("");
      setNewStage("");
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(/\s+/);
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  const avatarColors = [
    "bg-primary/20 text-primary",
    "bg-status-healthy/20 text-status-healthy",
    "bg-status-warning/20 text-status-warning",
    "bg-status-info/20 text-status-info",
    "bg-accent text-accent-foreground",
    "bg-status-danger/20 text-status-danger",
  ];
  const getAvatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Accounts</h1>
          <p className="text-sm text-muted-foreground">{accounts.length} total accounts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1 h-4 w-4" /> Add Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Account</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Company name" value={newName} onChange={e => setNewName(e.target.value)} />
              <Select value={newStage} onValueChange={setNewStage}>
                <SelectTrigger><SelectValue placeholder="Select pipeline stage" /></SelectTrigger>
                <SelectContent>
                  {stages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleCreate} className="w-full" disabled={createAccount.isPending}>Create Account</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search accounts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {stages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex rounded-lg border overflow-hidden">
          <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("grid")}><LayoutGrid className="h-4 w-4" /></Button>
          <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Account cards */}
      {isLoading ? (
        <div className="text-center text-muted-foreground py-12">Loading accounts...</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No accounts found. Create your first account!</CardContent></Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(account => {
            const { done, total } = getCompletedRatio(account.id);
            const stageColor = getStageColor(account.pipeline_stage_id);
            return (
              <Card
                key={account.id}
                className="cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border-0 shadow-md overflow-hidden"
                onClick={() => navigate(`/accounts/${account.id}`)}
              >
                <div className="h-1" style={{ backgroundColor: stageColor }} />
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium">
                        {total} Tasks · {account.industry || "No industry"}
                      </p>
                      <p className="font-display font-bold text-lg mt-0.5 truncate">{account.company_name}</p>
                    </div>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${getAvatarColor(account.company_name)}`}>
                      {getInitials(account.company_name)}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: total > 0 ? `${(done / total) * 100}%` : "0%",
                          backgroundColor: stageColor,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-display font-semibold">
                        {done}/{total}
                      </span>
                      <HealthBadge score={account.health_score ?? 50} size="sm" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(account => (
            <Card
              key={account.id}
              className="cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => navigate(`/accounts/${account.id}`)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <HealthBadge score={account.health_score ?? 50} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{account.company_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{account.contact_name || "No contact"} · {account.industry || "No industry"}</p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] shrink-0"
                  style={{ borderColor: getStageColor(account.pipeline_stage_id) + "50", color: getStageColor(account.pipeline_stage_id) }}
                >
                  {getStageName(account.pipeline_stage_id)}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
