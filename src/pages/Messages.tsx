import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import type { Message } from "../shared";
import { http } from "../lib/api";
import { useConfirm } from "../components/confirm";
import { Badge, Card, EmptyState, IconButton, PageHeader, Spinner, cx } from "../components/ui";

export function Messages() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const key = ["/admin/messages"];
  const { data = [], isLoading } = useQuery({ queryKey: key, queryFn: () => http.get<Message[]>("/admin/messages") });
  const toggle = useMutation({
    mutationFn: (m: Message) => http.patch(`/admin/messages/${m.id}`, { read: !m.read }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => http.del(`/admin/messages/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
  const unread = data.filter((m) => !m.read).length;

  const askDelete = async (m: Message) => {
    if (await confirm({ title: "Delete message?", message: `The message from ${m.name} will be permanently deleted.`, confirmLabel: "Delete", danger: true }))
      remove.mutate(m.id);
  };

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle="Sent from the contact form on your portfolio."
        action={unread > 0 ? <Badge tone="warning">{unread} unread</Badge> : undefined}
      />

      {isLoading ? (
        <Spinner />
      ) : data.length === 0 ? (
        <Card>
          <EmptyState icon={Mail} title="No messages yet" text="When someone uses the contact form, their message shows up here." />
        </Card>
      ) : (
        <div className="space-y-3">
          {data.map((m) => (
            <Card key={m.id} className={cx("relative transition-colors", !m.read && "border-line-strong bg-surface-2")}>
              {!m.read && <span className="absolute top-6 left-0 h-6 w-0.5 rounded-r-full bg-accent" aria-hidden />}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-elevated text-sm font-semibold text-fg-muted uppercase">
                    {m.name[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium text-fg">
                      <span className="truncate">{m.name}</span>
                      {!m.read && <Badge tone="accent">New</Badge>}
                    </p>
                    <p className="truncate text-xs text-fg-subtle">
                      {m.email} · {new Date(m.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`}
                    aria-label={`Reply to ${m.name}`}
                    title="Reply"
                    className="inline-flex size-9 items-center justify-center rounded-lg text-fg-subtle transition-colors hover:bg-elevated hover:text-fg"
                  >
                    <Reply size={16} />
                  </a>
                  <IconButton label={m.read ? "Mark as unread" : "Mark as read"} icon={m.read ? Mail : MailOpen} onClick={() => toggle.mutate(m)} />
                  <IconButton label="Delete message" icon={Trash2} tone="danger" onClick={() => askDelete(m)} />
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap text-fg-muted">{m.message}</p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
