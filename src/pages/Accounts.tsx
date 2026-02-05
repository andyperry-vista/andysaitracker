import { useState } from "react";
import { useAccounts, usePipelineStages, useCreateAccount } from "@/hooks/useAccounts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HealthBadge } from "@/components/HealthBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Accounts() {
  const { data: accounts = [], isLoading } = useAccounts();
  const { data: stages = [] } = usePipelineStages();
  const createAccount = useCreateAccount();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStage, setNewStage] = useState("");

  const filtered = accounts.filter(a => {
    const matchesSearch = a.company_name.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === "all" || a.pipeline_stage_id === stageFilter;
    return matchesSearch && matchesStage;
  });

  const getStageName = (id: string | null) => stages.find(s => s.id === id)?.name ?? "—";
  const getStageColor = (id: string | null) => stages.find(s => s.id === id)?.color ?? "#6366f1";

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createAccount.mutateAsync({
        company_name: newName,
        pipeline_stage_id: newStage || null,
      });
      toast.success("Account created");
      setNewName("");
      setNewStage("");
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

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
              <Button onClick={handleCreate} className="w-full" disabled={createAccount.isPending}>
                Create Account
              </Button>
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
      </div>

      {/* Account list */}
      {isLoading ? (
        <div className="text-center text-muted-foreground py-12">Loading accounts...</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No accounts found. Create your first account!</CardContent></Card>
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
