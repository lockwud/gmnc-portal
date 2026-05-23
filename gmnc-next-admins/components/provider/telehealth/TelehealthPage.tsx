'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Calendar, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { getTelehealthRooms, cancelTelehealthRoom, createTelehealthRoom } from '@/lib/api/telehealth';
import { useCountdown } from '@/lib/hooks/useCountdown';
import TelehealthRoomsSkeleton from './TelehealthRoomsSkeleton';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import type { TelehealthRoomType } from '@/lib/api/types';

export default function TelehealthPage() {
  const { token } = useAuth();
  const [rooms, setRooms] = useState<TelehealthRoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const timeFilters = [
    { value: 'all', label: 'All time' },
    { value: 'days', label: 'Days' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];

  useEffect(() => {
    async function loadData() {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getTelehealthRooms(token);
        setRooms(data.rooms || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load telehealth rooms');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  const handleCancelRoom = async (id: string) => {
    if (!token || !confirm('Are you sure you want to cancel this telehealth room?')) return;
    try {
      await cancelTelehealthRoom(id, token);
      setRooms(rooms.filter(r => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel room');
    }
  };

  const handleJoinRoom = (room: TelehealthRoomType) => {
    if (room.joinUrl) {
      window.open(room.joinUrl, '_blank', 'noopener,noreferrer');
    } else {
      setError('No join URL available for this room');
    }
  };

  const handleCreateRoom = async (formData: FormData) => {
    if (!token) return;
    try {
      setCreateLoading(true);
      const payload = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        scheduledStart: formData.get('scheduledStart') as string,
        scheduledEnd: formData.get('scheduledEnd') as string,
      };
      const newRoom = await createTelehealthRoom(payload, token);
      setRooms([newRoom, ...rooms]);
      setShowCreateModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setCreateLoading(false);
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

  const filteredRooms = rooms.filter(room => {
    if (filter === 'all') return true;
    return room.status === filter;
  });

  if (loading) {
    return <TelehealthRoomsSkeleton />;
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 max-w-full flex-col overflow-hidden">
      <div className="mb-4 flex shrink-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[18px] font-bold tracking-tight text-slate-900">
            Telehealth Rooms
          </h1>
          <p className="mt-1 flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Manage telehealth sessions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full bg-slate-100 p-1">
            {timeFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-full transition ${
                  filter === f.value
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:text-slate-800'
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
          title="No telehealth rooms found"
          description="Create your first telehealth room to get started."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => (
            <div key={room.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-slate-900 truncate">{room.title || 'Untitled Room'}</h3>
                <span className={`text-[10px] px-2 py-1 rounded-full ${getStatusClass(room.status)}`}>
                  {room.status}
                </span>
              </div>

              {room.description && (
                <p className="mt-2 text-[11px] text-slate-500 line-clamp-2">{room.description}</p>
              )}

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
                {room.scheduledStart && room.status === 'scheduled' && (
                  <CountdownDisplay scheduledStart={room.scheduledStart} />
                )}
                <button 
                  onClick={() => handleJoinRoom(room)}
                  disabled={!room.joinUrl}
                  className={`text-[11px] font-medium transition flex items-center gap-1 ${
                    room.joinUrl 
                      ? 'text-emerald-600 hover:text-emerald-700' 
                      : 'text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ExternalLink className="h-3 w-3" />
                  Join
                </button>
                <button
                  onClick={() => handleCancelRoom(room.id)}
                  className="text-[11px] text-red-500 font-medium hover:text-red-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Create Telehealth Room</h2>
          <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              handleCreateRoom(formData);
            }} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Title</label>
              <input
                name="title"
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                placeholder="Room title"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none resize-none"
                placeholder="Room description"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Start</label>
                <input
                  name="scheduledStart"
                  type="datetime-local"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">End</label>
                <input
                  name="scheduledEnd"
                  type="datetime-local"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-[11px] text-slate-600 hover:text-slate-800 px-3 py-1"
              >
                Cancel
              </button>
              <Button type="submit" disabled={createLoading}>
                {createLoading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

function CountdownDisplay({ scheduledStart }: { scheduledStart: string }) {
  const countdown = useCountdown(scheduledStart);
  
  if (!countdown) return null;
  
  if (countdown.isLive) {
    return (
      <span className="text-[11px] text-emerald-600 font-medium animate-pulse">
        LIVE NOW
      </span>
    );
  }
  
  if (countdown.isPast) {
    return (
      <span className="text-[11px] text-slate-400">
        Session ended
      </span>
    );
  }
  
  const parts = [];
  if (countdown.days > 0) parts.push(`${countdown.days}d`);
  if (countdown.hours > 0 || parts.length > 0) parts.push(`${countdown.hours}h`);
  parts.push(`${countdown.minutes}m`);
  
  return (
    <span className="text-[11px] text-slate-500">
      Starts in {parts.join(' ')}
    </span>
  );
}