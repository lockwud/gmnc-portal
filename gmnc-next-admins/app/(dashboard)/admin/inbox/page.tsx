'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import {
  adminAddMessage,
  adminGetTicket,
  adminListTickets,
  adminUpdateTicket,
} from '@/lib/api/support';
import type { SupportPriority, SupportTicket, SupportTicketStatus } from '@/lib/api/types';

const STATUSES: SupportTicketStatus[] = ['OPEN', 'IN_PROGRESS', 'WAITING_ON_USER', 'RESOLVED', 'CLOSED'];
const PRIORITIES: SupportPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

function statusBadge(status: SupportTicketStatus) {
  if (status === 'OPEN') return 'bg-amber-50 text-amber-700';
  if (status === 'RESOLVED' || status === 'CLOSED') return 'bg-emerald-50 text-emerald-700';
  return 'bg-slate-100 text-slate-600';
}

export default function AdminInboxRoute() {
  return (
    <ProtectedRoute requiredRole={['admin', 'support']}>
      <InboxPage />
    </ProtectedRoute>
  );
}

function InboxPage() {
  const { token } = useAuth();
  const { show } = useToast();
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | ''>('');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SupportTicket | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await adminListTickets(
        statusFilter ? { status: statusFilter, limit: 50 } : { limit: 50 },
        token ?? undefined,
      );
      setTickets(result.tickets ?? []);
    } catch (error) {
      show({ type: 'error', title: 'Inbox unavailable', message: error instanceof Error ? error.message : 'Failed to load tickets' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, token, show]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const openTicket = async (id: string) => {
    try {
      setSelectedId(id);
      setLoadingDetail(true);
      setDetail(await adminGetTicket(id, token ?? undefined));
    } catch (error) {
      show({ type: 'error', title: 'Load failed', message: error instanceof Error ? error.message : 'Failed to load ticket' });
    } finally {
      setLoadingDetail(false);
    }
  };

  const refreshList = async () => {
    await load();
    if (selectedId) {
      try {
        setDetail(await adminGetTicket(selectedId, token ?? undefined));
      } catch {
        // list refresh is what matters
      }
    }
  };

  const updateTicket = async (patch: { status?: SupportTicketStatus; priority?: SupportPriority }) => {
    if (!selectedId) return;
    try {
      const updated = await adminUpdateTicket(selectedId, patch, token ?? undefined);
      setDetail(updated);
      setTickets((current) => current.map((t) => (t.ticketId === updated.ticketId ? updated : t)));
      show({ type: 'success', title: 'Ticket updated', message: `Ticket ${updated.ticketNumber ?? ''} updated.` });
    } catch (error) {
      show({ type: 'error', title: 'Update failed', message: error instanceof Error ? error.message : 'Failed to update ticket' });
    }
  };

  const sendReply = async () => {
    if (!selectedId || !reply.trim()) return;
    try {
      setSending(true);
      await adminAddMessage(selectedId, { content: reply.trim() }, token ?? undefined);
      setReply('');
      await refreshList();
    } catch (error) {
      show({ type: 'error', title: 'Reply failed', message: error instanceof Error ? error.message : 'Failed to send reply' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-white px-6 py-5">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-950">Support Inbox</h1>
          <p className="mt-1 text-xs text-slate-500">Triage user tickets: reply, set priority, resolve or close.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${statusFilter === '' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            All
          </button>
          {STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${statusFilter === status ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <p className="p-4 text-xs text-slate-500">Loading tickets…</p>
          ) : tickets.length === 0 ? (
            <div className="p-4"><EmptyState title="No tickets" description="Nothing in this queue right now." /></div>
          ) : (
            <ul className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
              {tickets.map((ticket) => (
                <li key={ticket.ticketId}>
                  <button
                    type="button"
                    onClick={() => void openTicket(ticket.ticketId)}
                    className={`w-full px-4 py-3 text-left transition hover:bg-slate-50 ${selectedId === ticket.ticketId ? 'bg-emerald-50/60' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-slate-900">{ticket.subject}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusBadge(ticket.status)}`}>
                        {ticket.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {ticket.ticketNumber ?? ''} · {ticket.category} · {ticket.priority}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <main className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {!selectedId || loadingDetail ? (
            <p className="text-sm text-slate-500">{loadingDetail ? 'Loading ticket…' : 'Select a ticket to triage it.'}</p>
          ) : !detail ? (
            <p className="text-sm text-slate-500">Ticket unavailable.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-900">{detail.subject}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {detail.ticketNumber ?? ''} · {detail.category} · opened {new Date(detail.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadge(detail.status)}`}>
                  {detail.status.replace(/_/g, ' ')}
                </span>
              </div>

              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{detail.description}</p>

              <div className="flex flex-wrap gap-2">
                <select
                  value={detail.status}
                  onChange={(e) => void updateTicket({ status: e.target.value as SupportTicketStatus })}
                  className="h-9 rounded-md border border-slate-200 px-2 text-xs font-bold text-slate-700 outline-none"
                  aria-label="Ticket status"
                >
                  {STATUSES.map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
                </select>
                <select
                  value={detail.priority}
                  onChange={(e) => void updateTicket({ priority: e.target.value as SupportPriority })}
                  className="h-9 rounded-md border border-slate-200 px-2 text-xs font-bold text-slate-700 outline-none"
                  aria-label="Ticket priority"
                >
                  {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Conversation</h3>
                {(detail.messages ?? []).length === 0 ? (
                  <p className="text-xs text-slate-500">No messages yet.</p>
                ) : (
                  <ul className="max-h-[300px] space-y-2 overflow-y-auto">
                    {detail.messages.map((message, index) => (
                      <li key={message.messageId || index} className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${message.senderRole === 'SUPPORT' ? 'ml-auto bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        {message.sender?.fullName ? (
                          <p className={`mb-0.5 text-[10px] font-bold ${message.senderRole === 'SUPPORT' ? 'text-slate-300' : 'text-slate-500'}`}>
                            {message.sender.fullName}
                          </p>
                        ) : null}
                        {message.content}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write an admin reply…"
                  className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--color-brand)]"
                />
                <button
                  type="button"
                  onClick={() => void sendReply()}
                  disabled={sending || !reply.trim()}
                  className="h-10 rounded-xl px-4 text-xs font-bold text-white transition disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-brand)' }}
                >
                  {sending ? 'Sending…' : 'Reply'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
