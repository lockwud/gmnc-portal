'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Calendar, Clock, ExternalLink, Users, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import {
  getTelehealthRooms,
  createTelehealthRoom,
  updateTelehealthRoom,
  cancelTelehealthRoom,
  joinTelehealthRoom,
  inviteToTelehealthRoom,
  getRoomParticipants,
  type TelehealthRoomType,
} from '@/lib/api/telehealth';
import { useCountdown } from '@/lib/hooks/useCountdown';
import TelehealthRoomsSkeleton from './TelehealthRoomsSkeleton';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';

export default function TelehealthPage() {
  const { token } = useAuth();
  const [rooms, setRooms] = useState<TelehealthRoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | TelehealthRoomType['status']>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [invitingRoomId, setInvitingRoomId] = useState<string | null>(null);
  const [participantsRoomId, setParticipantsRoomId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Array<{ id: string; name: string; email: string; role: string }>>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const [reschedulingRoom, setReschedulingRoom] = useState<TelehealthRoomType | null>(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const { show } = useToast();

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'live', label: 'Live' },
    { value: 'completed', label: 'Completed' },
    { value: 'canceled', label: 'Canceled' },
  ];

  const loadRooms = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getTelehealthRooms(token);
      setRooms(data.rooms || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load rooms';
      setError(msg);
      show({ type: 'error', title: 'Error', message: msg });
    } finally {
      setLoading(false);
    }
  }, [token, show]);

  useEffect(() => {
    void loadRooms();
  }, [loadRooms]);

  const handleCreateRoom = async (formData: FormData) => {
    if (!token) return;
    try {
      setCreateLoading(true);
      setError(null);
      const payload = {
        title: (formData.get('title') as string) || undefined,
        description: (formData.get('description') as string) || undefined,
        scheduledStart: (formData.get('scheduledStart') as string) || undefined,
        scheduledEnd: (formData.get('scheduledEnd') as string) || undefined,
      };
      const newRoom = await createTelehealthRoom(payload, token);
      setRooms((prev) => [newRoom, ...prev]);
      setShowCreateModal(false);
      show({ type: 'success', title: 'Room Created', message: `Google Meet link generated for "${newRoom.title || 'Untitled Room'}"`, duration: 4000 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create room';
      setError(msg);
      show({ type: 'error', title: 'Error', message: msg });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleReschedule = async (formData: FormData) => {
    if (!token || !reschedulingRoom) return;
    try {
      setRescheduleLoading(true);
      setError(null);
      const payload = {
        scheduledStart: (formData.get('scheduledStart') as string) || undefined,
        scheduledEnd: (formData.get('scheduledEnd') as string) || undefined,
      };
      const updated = await updateTelehealthRoom(reschedulingRoom.id, payload, token);
      setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setReschedulingRoom(null);
      show({ type: 'success', title: 'Room Rescheduled', message: 'Google Meet has been updated with new times.', duration: 4000 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to reschedule';
      setError(msg);
      show({ type: 'error', title: 'Error', message: msg });
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleCancel = async (room: TelehealthRoomType) => {
    if (!token) return;
    const confirmed = confirm(`Cancel "${room.title || 'this room'}"? The Google Meet link will be terminated and all participants notified.`);
    if (!confirmed) return;
    try {
      setError(null);
      await cancelTelehealthRoom(room.id, token);
      setRooms((prev) => prev.map((r) => (r.id === room.id ? { ...r, status: 'canceled' as const } : r)));
      show({ type: 'success', title: 'Room Canceled', message: 'Google Meet link canceled and notifications sent.', duration: 4000 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel room';
      setError(msg);
      show({ type: 'error', title: 'Error', message: msg });
    }
  };

  const handleJoin = async (room: TelehealthRoomType) => {
    if (!token) return;
    try {
      const data = await joinTelehealthRoom(room.id, token);
      if (data.joinUrl) {
        window.open(data.joinUrl, '_blank', 'noopener,noreferrer');
      } else {
        setError('No join URL available');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to join room';
      setError(msg);
    }
  };

  const handleInvite = async (emails: string) => {
    if (!invitingRoomId || !token) return;
    const emailList = emails.split(',').map((e) => e.trim()).filter(Boolean);
    if (emailList.length === 0) {
      show({ type: 'warning', title: 'No Emails', message: 'Enter at least one email address.' });
      return;
    }
    try {
      await inviteToTelehealthRoom(invitingRoomId, emailList, token);
      setInvitingRoomId(null);
      show({ type: 'success', title: 'Invites Sent', message: `${emailList.length} participant(s) added to Google Meet.`, duration: 4000 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to invite';
      show({ type: 'error', title: 'Error', message: msg });
    }
  };

  const openParticipants = async (room: TelehealthRoomType) => {
    if (!token) return;
    setParticipantsRoomId(room.id);
    setLoadingParticipants(true);
    setParticipants([]);
    try {
      const data = await getRoomParticipants(room.id, token);
      setParticipants(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load participants';
      show({ type: 'error', title: 'Error', message: msg });
    } finally {
      setLoadingParticipants(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-50 text-blue-700';
      case 'live': return 'bg-emerald-50 text-emerald-700';
      case 'completed': return 'bg-slate-100 text-slate-600';
      case 'canceled': return 'bg-red-50 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const filteredRooms = rooms.filter((room) => (filter === 'all' ? true : room.status === filter));

  if (loading) {
    return <TelehealthRoomsSkeleton />;
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 max-w-full flex-col overflow-hidden">
      <div className="mb-4 flex shrink-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[18px] font-bold tracking-tight text-slate-900">Telehealth Rooms</h1>
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Google Meet–powered sessions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full bg-slate-100 p-1">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as typeof filter)}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-full transition ${
                  filter === f.value ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Plus size={16} />
            </span>
            Create Room
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[11px] text-red-600">
          {error}
        </div>
      )}

      {filteredRooms.length === 0 ? (
        <EmptyState
          title="No rooms found"
          description={
            filter === 'all'
              ? 'Create your first telehealth room to get started.'
              : `No rooms with status "${filter}".`
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => {
            const countdown = room.scheduledStart && room.status === 'scheduled' ? useCountdown(room.scheduledStart) : null;
            return (
              <div key={room.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-slate-900 truncate">{room.title || 'Untitled Room'}</h3>
                  <span className={`text-[10px] px-2 py-1 rounded-full ${getStatusClass(room.status)}`}>{room.status}</span>
                </div>

                <div className="mt-3 space-y-2 text-[11px]">
                  {room.scheduledStart && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span>{new Date(room.scheduledStart).toLocaleDateString()}</span>
                    </div>
                  )}
                  {room.scheduledEnd && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span>{new Date(room.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  {room.status === 'scheduled' && countdown && (
                    <span className="text-[11px] tabular-nums">
                      {countdown.isLive ? (
                        <span className="text-emerald-600 font-medium animate-pulse">LIVE NOW</span>
                      ) : countdown.isPast ? (
                        <span className="text-slate-400">Session ended</span>
                      ) : (
                        <span className="text-slate-500">Starts in {[countdown.days > 0 ? `${countdown.days}d` : null, `${countdown.hours}h`, `${countdown.minutes}m`].filter(Boolean).join(' ')}</span>
                      )}
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => void openParticipants(room)}
                      className="text-[11px] text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
                      title="View participants"
                    >
                      <Users className="h-3 w-3" />
                    </button>
                    {room.status !== 'canceled' && room.status !== 'completed' && (
                      <>
                        <button
                          onClick={() => setReschedulingRoom(room)}
                          className="text-[11px] text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
                          title="Reschedule"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => void handleCancel(room)}
                          className="text-[11px] text-red-500 hover:text-red-600 inline-flex items-center gap-1"
                          title="Cancel room"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => void handleJoin(room)}
                      disabled={!room.joinUrl}
                      className={`text-[11px] font-medium inline-flex items-center gap-1 ${
                        room.joinUrl ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Join
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <CreateRoomForm onCreate={handleCreateRoom} loading={createLoading} onCancel={() => setShowCreateModal(false)} />
      </Modal>

      {reschedulingRoom && (
        <Modal isOpen onClose={() => setReschedulingRoom(null)}>
          <RescheduleForm
            room={reschedulingRoom}
            onReschedule={handleReschedule}
            loading={rescheduleLoading}
            onCancel={() => setReschedulingRoom(null)}
          />
        </Modal>
      )}

      <Modal isOpen={invitingRoomId !== null} onClose={() => setInvitingRoomId(null)}>
        <InviteForm onInvite={handleInvite} onCancel={() => setInvitingRoomId(null)} />
      </Modal>

      <Modal isOpen={participantsRoomId !== null} onClose={() => setParticipantsRoomId(null)}>
        <ParticipantsPanel
          participants={participants}
          loading={loadingParticipants}
          onInviteMore={() => {
            setParticipantsRoomId(null);
            const room = rooms.find((r) => r.id === participantsRoomId);
            if (room) setInvitingRoomId(room.id);
          }}
          onClose={() => setParticipantsRoomId(null)}
        />
      </Modal>
    </div>
  );
}

function CreateRoomForm({
  onCreate,
  loading,
  onCancel,
}: {
  onCreate: (formData: FormData) => void;
  loading: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Create Telehealth Room</h2>
      <p className="text-xs text-slate-500 mb-4">A Google Meet link will be created automatically and shared with invited participants.</p>
      <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); onCreate(fd); }} className="space-y-4">
        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-1">Title</label>
          <input name="title" required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" placeholder="e.g. Initial Consultation" />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-1">Description (optional)</label>
          <textarea name="description" rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none resize-none" placeholder="Session details, notes..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Scheduled Start</label>
            <input name="scheduledStart" type="datetime-local" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Scheduled End</label>
            <input name="scheduledEnd" type="datetime-local" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="text-[11px] text-slate-600 hover:text-slate-800 px-3 py-1">Cancel</button>
          <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
        </div>
      </form>
    </div>
  );
}

function RescheduleForm({
  room,
  onReschedule,
  loading,
  onCancel,
}: {
  room: TelehealthRoomType;
  onReschedule: (formData: FormData) => void;
  loading: boolean;
  onCancel: () => void;
}) {
  const defaultStart = room.scheduledStart
    ? new Date(room.scheduledStart).toISOString().slice(0, 16)
    : '';
  const defaultEnd = room.scheduledEnd
    ? new Date(room.scheduledEnd).toISOString().slice(0, 16)
    : '';

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Reschedule Room</h2>
      <p className="text-xs text-slate-500 mb-4">{room.joinUrl ? 'Google Meet link will be updated with new times.' : ''}</p>
      <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); onReschedule(fd); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">New Start</label>
            <input name="scheduledStart" type="datetime-local" defaultValue={defaultStart} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">New End</label>
            <input name="scheduledEnd" type="datetime-local" defaultValue={defaultEnd} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="text-[11px] text-slate-600 hover:text-slate-800 px-3 py-1">Cancel</button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Update'}</Button>
        </div>
      </form>
    </div>
  );
}

function InviteForm({
  onInvite,
  onCancel,
}: {
  onInvite: (emails: string) => void;
  onCancel: () => void;
}) {
  const [emails, setEmails] = useState('');

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Invite Participants</h2>
      <p className="text-xs text-slate-500 mb-4">Comma-separated emails. Each invitee will receive the Google Meet link.</p>
      <textarea
        value={emails}
        onChange={(e) => setEmails(e.target.value)}
        rows={4}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none resize-none"
        placeholder="patient@example.com, assistant@example.com"
      />
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onCancel} className="text-[11px] text-slate-600 hover:text-slate-800 px-3 py-1">Cancel</button>
        <Button onClick={() => onInvite(emails)}>Send Invite</Button>
      </div>
    </div>
  );
}

function ParticipantsPanel({
  participants,
  loading,
  onInviteMore,
  onClose,
}: {
  participants: Array<{ id: string; name: string; email: string; role: string }>;
  loading: boolean;
  onInviteMore: () => void;
  onClose: () => void;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Participants</h2>
      {loading ? (
        <div className="text-xs text-slate-500">Loading participants...</div>
      ) : participants.length === 0 ? (
        <EmptyState title="No participants yet" description="Invite patients or staff to this room." />
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto">
          {participants.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-800">{p.name || 'Unknown'}</p>
                <p className="text-[11px] text-slate-500">{p.email}</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600">{p.role}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
        <button type="button" onClick={onInviteMore} className="text-[11px] text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
          <Plus className="h-3 w-3" /> Invite more
        </button>
        <button type="button" onClick={onClose} className="text-[11px] text-slate-600 hover:text-slate-800 px-3 py-1">Close</button>
      </div>
    </div>
  );
}
