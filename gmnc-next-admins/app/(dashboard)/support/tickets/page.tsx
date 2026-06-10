'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import SmallDropdown from '@/components/ui/SmallDropdown';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/context/AuthContext';
import { createTicket, listTickets } from '@/lib/api/support';
import type { SupportCategory, SupportTicket } from '@/lib/api/types';

const TICKET_CATEGORIES: { label: string; value: SupportCategory }[] = [
  { label: 'Account', value: 'ACCOUNT' },
  { label: 'Appointment', value: 'APPOINTMENT' },
  { label: 'Technical', value: 'TECHNICAL' },
  { label: 'Billing', value: 'BILLING' },
  { label: 'Caregiver Support', value: 'CAREGIVER_SUPPORT' },
  { label: 'Provider Support', value: 'PROVIDER_SUPPORT' },
  { label: 'Other', value: 'OTHER' },
];

const PRIORITIES: { label: string; value: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' }[] = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
];

export default function SupportTicketsPage() {
  const router = useRouter();
  const { show } = useToast();
  const { token } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);

  const [category, setCategory] = useState<SupportCategory>('OTHER');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listTickets({}, token ?? undefined);
      setTickets(data.tickets ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tickets';
      setError(message);
      show({ type: 'error', title: 'Load failed', message, duration: 4000 });
    } finally {
      setLoading(false);
    }
  }, [show, token]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const sorted = useMemo(
    () =>
      [...tickets].sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return bTime - aTime;
      }),
    [tickets]
  );

  const resetCreateForm = () => {
    setCategory('OTHER');
    setSubject('');
    setDescription('');
    setPriority('MEDIUM');
    setCreateError(null);
    setIsSubmitting(false);
    setCategoryOpen(false);
    setPriorityOpen(false);
  };

  const handleOpenCreateModal = () => {
    resetCreateForm();
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    resetCreateForm();
  };

  const handleCreateTicket = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    try {
      setIsSubmitting(true);
      setCreateError(null);
      const ticket = await createTicket(
        {
          category,
          subject: subject.trim(),
          description: description.trim(),
          priority,
        },
        token ?? undefined,
      );

      show({
        type: 'success',
        title: 'Ticket created',
        message: 'Your support request has been submitted.',
        duration: 4000,
      });

      handleCloseCreateModal();
      router.push(`/support/tickets/${ticket.ticketId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create ticket';
      setCreateError(message);
      show({ type: 'error', title: 'Submission failed', message, duration: 4000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h1 className="text-[15px] font-semibold text-slate-900">My Tickets</h1>
          <p className="mt-1 text-xs text-slate-500">
            Review and continue open support requests.
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
        >
          New Ticket
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-6 pb-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-24 rounded-2xl border border-slate-200 bg-slate-50"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center">
            <EmptyState
              title="Unable to load tickets"
              description={error}
            />
            <Button
              onClick={loadTickets}
              className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100"
            >
              Try again
            </Button>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              ✉️
            </div>
            <h2 className="text-lg font-semibold text-slate-900">No tickets yet</h2>
            <p className="mt-2 text-sm text-slate-500">You have no support tickets. Create one and our team will help.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((ticket) => (
              <article
                key={ticket.ticketId}
                className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">{ticket.ticketNumber ?? ticket.ticketId}</span>
                      <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-100">
                        {ticket.status}
                      </span>
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-slate-900">{ticket.subject}</h3>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">{ticket.description}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/support/tickets/${ticket.ticketId}`}
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal}>
        <div className="w-full max-w-xl rounded-2xl bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">New support ticket</h2>
              <p className="text-xs text-slate-500">
                Describe your issue and we’ll route it to the right team.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloseCreateModal}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-4">
            {createError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {createError}
              </div>
            )}

            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-700">Category</label>
              <SmallDropdown<SupportCategory>
                value={category}
                options={TICKET_CATEGORIES}
                onChange={setCategory}
                placeholder="Select category"
                open={categoryOpen}
                onOpenChange={setCategoryOpen}
                pageSize={4}
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-700">Subject</label>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="One-line summary of your issue"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-700">Description</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Please include steps to reproduce, expected behavior, and any relevant context."
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-700">Priority</label>
              <SmallDropdown<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>
                value={priority}
                options={PRIORITIES}
                onChange={setPriority}
                placeholder="Select priority"
                open={priorityOpen}
                onOpenChange={setPriorityOpen}
                pageSize={4}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseCreateModal}
                className="inline-flex rounded-full bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={!subject.trim() || !description.trim() || isSubmitting}
                className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting...' : 'Submit ticket'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
