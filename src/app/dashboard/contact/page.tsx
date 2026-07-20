"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { ContactInfoDto, ContactMessageDto } from "@/lib/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Trash2 } from "lucide-react";

export default function ContactPage() {
  const [info, setInfo] = useState<ContactInfoDto | null>(null);
  const [messages, setMessages] = useState<ContactMessageDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [i, m] = await Promise.all([
        api.get<ContactInfoDto>("/api/contact/info").catch(() => null),
        api.get<ContactMessageDto[]>("/api/contact/messages"),
      ]);
      setInfo(i);
      setMessages(m);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load contact data.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!info) return;
    await api.put("/api/contact/info", {
      address: info.address,
      phone: info.phone,
      email: info.email,
      mapEmbedUrl: info.mapEmbedUrl || null,
    });
    load();
  }

  async function markRead(id: string) {
    await api.put(`/api/contact/messages/${id}/read`);
    load();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this message?")) return;
    await api.delete(`/api/contact/messages/${id}`);
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-text">Contact</h1>
        <p className="mt-1 text-sm text-text-muted">Office details and inbound enquiries.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card>
        <CardHeader title="Office details" />
        <CardBody>
          {info ? (
            <form onSubmit={handleInfoSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Address" helper="The map on the site is generated automatically from this address.">
                  <Input value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} />
                </Field>
                <Field label="Phone">
                  <Input value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} />
                </Field>
                <Field label="Email">
                  <Input value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} />
                </Field>
                <Field
                  label="Map override URL (optional)"
                  helper="Only needed for a precisely pinned location. Get one from Google Maps: search your place → Share → Embed a map → copy the src=&quot;...&quot; URL from the code."
                >
                  <Input
                    value={info.mapEmbedUrl ?? ""}
                    onChange={(e) => setInfo({ ...info, mapEmbedUrl: e.target.value })}
                    placeholder="Leave blank to use the address above"
                  />
                </Field>
              </div>
              <div>
                <Button type="submit">Save details</Button>
              </div>
            </form>
          ) : (
            <div className="animate-pulse flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 rounded-md bg-border/70" />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Messages" description={messages ? `${messages.length} total` : undefined} />
        {messages === null && <SkeletonTable rows={4} cols={4} />}
        {messages && messages.length === 0 && <EmptyState label="No messages yet." />}
        {messages && messages.length > 0 && (
          <Table>
            <TableHead columns={["From", "Message", "Status", ""]} />
            <tbody>
              {messages.map((msg) => (
                <TableRow key={msg.id}>
                  <TableCell>
                    <span className="font-semibold text-text">{msg.name}</span>
                    <br />
                    <span className="text-text-muted text-xs">{msg.email}</span>
                  </TableCell>
                  <TableCell muted>{msg.message}</TableCell>
                  <TableCell>
                    <Badge tone={msg.isRead ? "neutral" : "success"}>
                      {msg.isRead ? "Read" : "New"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {!msg.isRead && (
                        <Button variant="secondary" size="sm" onClick={() => markRead(msg.id)}>
                          Mark read
                        </Button>
                      )}
                      <Button variant="danger" size="sm" onClick={() => handleDelete(msg.id)}>
                        <Trash2 size={14} strokeWidth={1.75} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
