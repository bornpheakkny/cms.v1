import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import type { Message } from "../shared";
import { http } from "../lib/api";
import { Badge, Button, Card, PageHeader } from "../components/ui";

export function Messages() {
  const qc = useQueryClient();
  const key = ["/admin/messages"];
  const { data = [] } = useQuery({ queryKey: key, queryFn: () => http.get<Message[]>("/admin/messages") });
  const toggle = useMutation({
    mutationFn: (m: Message) => http.patch(`/admin/messages/${m.id}`, { read: !m.read }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => http.del(`/admin/messages/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return (
    <>
      <PageHeader title="Messages" subtitle="From the contact form on your portfolio." />
      <div className="space-y-3">
        {data.map((m) => (
          <Card key={m.id} className={m.read ? "opacity-70" : ""}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">{m.name} <a href={`mailto:${m.email}`} className="text-sm font-normal text-indigo-300">&lt;{m.email}&gt;</a></p>
                <p className="text-xs text-slate-500">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                {!m.read && <Badge tone="amber">new</Badge>}
                <Button variant="ghost" onClick={() => toggle.mutate(m)}>{m.read ? "Mark unread" : "Mark read"}</Button>
                <Button variant="danger" onClick={() => confirm("Delete message?") && remove.mutate(m.id)}><Trash2 size={14} /></Button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{m.message}</p>
          </Card>
        ))}
        {data.length === 0 && <p className="text-sm text-slate-500">No messages yet.</p>}
      </div>
    </>
  );
}
