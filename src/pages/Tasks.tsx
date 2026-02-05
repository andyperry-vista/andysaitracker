import { useState } from "react";
import { useTasks, useCreateTask, useUpdateTask, Task } from "@/hooks/useTasks";
import { useAccounts } from "@/hooks/useAccounts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, GripVertical } from "lucide-react";
import { toast } from "sonner";

const COLUMNS: { key: Task["status"]; label: string; color: string }[] = [
  { key: "todo", label: "To Do", color: "hsl(var(--status-info))" },
  { key: "in_progress", label: "In Progress", color: "hsl(var(--status-warning))" },
  { key: "blocked", label: "Blocked", color: "hsl(var(--status-danger))" },
  { key: "done", label: "Done", color: "hsl(var(--status-healthy))" },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: "border-priority-low/30 text-priority-low",
  medium: "border-priority-medium/30 text-priority-medium",
  high: "border-priority-high/30 text-priority-high",
  urgent: "border-priority-urgent/30 text-priority-urgent",
};

export default function Tasks() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: accounts = [] } = useAccounts();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("medium");
  const [newAccount, setNewAccount] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      await createTask.mutateAsync({
        title: newTitle,
        description: newDesc || null,
        priority: newPriority,
        account_id: newAccount || null,
        due_date: newDueDate || null,
      });
      toast.success("Task created");
      setNewTitle(""); setNewDesc(""); setNewPriority("medium"); setNewAccount(""); setNewDueDate("");
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    try {
      await updateTask.mutateAsync({ id: taskId, status });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const getAccountName = (id: string | null) => accounts.find(a => a.id === id)?.company_name;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Task Board</h1>
          <p className="text-sm text-muted-foreground">{tasks.length} tasks</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1 h-4 w-4" /> Add Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Task title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              <Textarea placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Select value={newPriority} onValueChange={v => setNewPriority(v as Task["priority"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} />
              </div>
              <Select value={newAccount} onValueChange={setNewAccount}>
                <SelectTrigger><SelectValue placeholder="Link to account (optional)" /></SelectTrigger>
                <SelectContent>
                  {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.company_name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleCreate} className="w-full" disabled={createTask.isPending}>Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban board */}
      <div className="grid gap-4 lg:grid-cols-4">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: col.color }} />
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <span className="text-xs text-muted-foreground">({colTasks.length})</span>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {colTasks.map(task => (
                  <Card key={task.id} className="group">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">{task.title}</p>
                        <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[task.priority]}`}>
                          {task.priority}
                        </Badge>
                        {task.due_date && (
                          <Badge variant="outline" className="text-[10px]">{task.due_date}</Badge>
                        )}
                        {task.account_id && (
                          <Badge variant="secondary" className="text-[10px]">{getAccountName(task.account_id)}</Badge>
                        )}
                      </div>
                      {/* Quick status change */}
                      <Select value={task.status} onValueChange={v => handleStatusChange(task.id, v as Task["status"])}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {COLUMNS.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
