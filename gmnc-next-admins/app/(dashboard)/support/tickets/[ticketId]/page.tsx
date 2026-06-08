'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { addMessage, closeTicket, getTicket } from '@/lib/api/support';
import type { SupportMessage, SupportTicket, SupportTicketStatus } from '@/lib/api/types';
import { useAuth } from '@/lib/context/AuthContext';

export default function SupportTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { show } = useToast();
  const { token } = useAuth();
  const ticketId = typeof params.ticketId === 'string' ? params.ticketId : '';

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTicket = useCallback(async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getTicket(ticketId, token ?? undefined);
      setTicket(data);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Failed to load ticket';
      setError(messageText);
      show({ type: 'error', title: 'Load failed', message: messageText, duration: 4000 });
    } finally {
      setLoading(false);
    }
  }, [ticketId, show, token]);

  useEffect(() => {
    void loadTicket();
  }, [loadTicket]);

  const sortedMessages = useMemo(() => {
    if (!ticket) return [];
    return [...ticket.messages].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return aTime - bTime;
    });
  }, [ticket]);

  const handleCloseTicket = useCallback(async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      const data = await closeTicket(ticketId, token ?? undefined);
      setTicket(data);
      show({
        type: 'success',
        title: 'Ticket closed',
        message: 'This support ticket has been closed.',
        duration: 4000,
      });
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Failed to close ticket';
      setError(messageText);
      show({ type: 'error', title: 'Action failed', message: messageText, duration: 4000 });
    } finally {
      setLoading(false);
    }
  }, [show, ticketId, token]);

  const handleSendMessage = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!message.trim() || !ticketId) return;
      try {
        setIsSubmitting(true);
        setError(null);
        const data = await addMessage(ticketId, {
          content: message.trim(),
        });
        setTicket(data);
        setMessage('');
        show({
          type: 'success',
          title: 'Message sent',
          message: 'Your reply has been added.',
          duration: 4000,
        });
      } catch (err) {
        const messageText = err instanceof Error ? err.message : 'Failed to send message';
        setError(messageText);
        show({ type: 'error', title: 'Send failed', message: messageText, duration: 4000 });
      } finally {
        setIsSubmitting(false);
      }
    },
    [message, show, ticketId]
  );

  const formatDateTime = (value?: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const ticketStatusClass = (status: SupportTicketStatus) => {
    switch (status) {
      case 'OPEN':
        return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
      case 'WAITING_ON_USER':
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-100';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-500 ring-1 ring-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
    }
  };

  const renderMessageUi = (item: SupportMessage) => {
    const isUser = item.senderRole === 'USER';
    const alignedClass = isUser ? 'items-end text-right' : 'items-start text-left';
    const bubbleClass = isUser
      ? 'rounded-2xl rounded-br-sm bg-emerald-600 text-white'
      : 'rounded-2xl rounded-bl-sm bg-white text-slate-900 ring-1 ring-slate-200';

    return (
      <div key={item.messageId} className={`flex flex-col gap-1 ${alignedClass}`}>
        <div className={`max-w-[85%] ${isUser ? 'self-end' : 'self-start'}`}>
          <div className={`px-4 py-3 ${bubbleClass}`}>
            <p className="whitespace-pre-wrap break-words text-sm">{item.content}</p>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">{formatDateTime(item.createdAt)}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            ✉️
          </div>
          <div>
            <p className="text-xs text-slate-500">{ticket?.ticketNumber ?? ticket?.ticketId}</p>
            <h1 className="text-[17px] font-semibold text-slate-900">{ticket?.subject}</h1>
            <div className="mt-1 flex items-center gap-2">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${ticket ? ticketStatusClass(ticket.status) : 'bg-slate-100 text-slate-600'}`}>{ticket?.status?.replace('_', ' ')}</span>
              <span className="text-xs text-slate-400">Created {formatDateTime(ticket?.createdAt)}</span>
            </div>
          </div>
        </div>
        {ticket && ticket.status !== 'CLOSED' && (
          <Button
            onClick={handleCloseTicket}
            disabled={loading}
            className="rounded-full bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-60"
          >
            Close ticket
          </Button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-6 py-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-16 rounded-2xl border border-slate-200 bg-slate-50"
              />
            ))}
          </div>
        ) : error || !ticket ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error ?? 'Ticket not found.'}
            </div>
            <Link
              href="/support/tickets"
              className="inline-flex rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
            >
              Back to tickets
            </Link>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{ticket?.subject}</p>
              <p className="mt-2 text-sm text-slate-600">{ticket?.description}</p>
            </div>

            <div className="space-y-4">
              {sortedMessages.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  No messages yet. Start the conversation by sending a reply.
                </div>
              )}

              <div className="space-y-4">
                {sortedMessages.map((item) => {
                  const isUser = item.senderRole === 'USER';
                  const bubbleClass = isUser
                    ? 'ml-auto rounded-2xl rounded-br-sm bg-emerald-600 text-white'
                    : 'rounded-2xl rounded-bl-sm bg-white text-slate-900 ring-1 ring-slate-200';

                  return (
                    <div key={item.messageId} className="flex w-full items-start gap-3">
                      {!isUser && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">{item?.sender?.fullName ? item.sender.fullName.charAt(0) : 'S'}</div>
                      )}
                      <div className={`max-w-[85%] ${isUser ? 'ml-auto text-right' : ''}`}>
                        <div className={`px-4 py-3 ${bubbleClass}`}>
                          <p className="whitespace-pre-wrap break-words text-sm">{item.content}</p>
                        </div>
                        <p className="mt-1 text-[10px] text-slate-400">{formatDateTime(item.createdAt)}</p>
                      </div>
                      {isUser && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">U</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {ticket?.status !== 'CLOSED' && (
              <form onSubmit={handleSendMessage} className="space-y-3">
                <label className="block text-xs font-medium text-slate-700">Reply</label>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Type your reply here."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="submit"
                    disabled={!message.trim() || isSubmitting}
                    className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {isSubmitting ? 'Sending...' : 'Send reply'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
