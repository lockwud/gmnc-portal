'use client';

import React, { useEffect, useState } from 'react';
import {
  Edit3,
  ExternalLink,
  Gamepad2,
  Link2,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/lib/context/AuthContext';
import {
  createGame,
  deleteGame,
  getGames,
  publishGame,
  unpublishGame,
  updateGame,
} from '@/lib/api/games';
import type { GameResource, GameSource, UpdateGamePayload } from '@/lib/api/types';

type GameSourceFiltered = 'EXTERNAL' | 'UPLOADED';

const SOURCE_OPTIONS: Array<{ value: GameSourceFiltered; label: string }> = [
  { value: 'UPLOADED', label: 'Upload' },
  { value: 'EXTERNAL', label: 'Link' },
];

function parseTags(value: FormDataEntryValue | null) {
  return String(value ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatDate(value?: string | null) {
  if (!value) return 'Not published';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not published';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function sourceLabel(source: GameSource) {
  if (source === 'EXTERNAL') return 'External link';
  return 'Uploaded file';
}

function SourceGlyph({ source, className }: { source: GameSource; className?: string }) {
  if (source === 'EXTERNAL') return <Link2 className={className} />;
  return <UploadCloud className={className} />;
}

function getPreviewUrl(game: GameResource) {
  return game.embedUrl || game.files?.[0] || '';
}

function GameSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-4 h-36 rounded-lg bg-slate-100" />
          <div className="mb-2 h-4 w-2/3 rounded bg-slate-200" />
          <div className="mb-4 h-3 w-full rounded bg-slate-100" />
          <div className="flex gap-2">
            <div className="h-6 w-16 rounded-full bg-slate-100" />
            <div className="h-6 w-20 rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function GamePreview({ game }: { game: GameResource }) {
  const previewUrl = getPreviewUrl(game);

  if (game.thumbnail) {
    return (
      <div className="relative h-36 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
        <img src={game.thumbnail} alt="" className="h-full w-full object-cover" />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-700 shadow-sm">
          {sourceLabel(game.source)}
        </div>
      </div>
    );
  }

  if (previewUrl) {
    return (
      <div className="h-36 overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
        <iframe
          src={previewUrl}
          title={game.title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="flex h-36 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200">
          <SourceGlyph source={game.source} className="h-6 w-6" />
        </span>
        <p className="mt-3 text-xs font-semibold text-slate-700">{sourceLabel(game.source)}</p>
        <p className="mt-1 text-[11px] text-slate-400">Preview available after launch</p>
      </div>
    </div>
  );
}

function GameCard({
  game,
  busy,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  game: GameResource;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) {
  const previewUrl = getPreviewUrl(game);

  return (
    <article className="flex min-h-[330px] flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
      <GamePreview game={game} />

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-slate-950">{game.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {game.description || 'No description added yet.'}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
            game.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {game.isPublished ? 'Live' : 'Draft'}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
          {sourceLabel(game.source)}
        </span>
        {(game.tags ?? []).slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-4">
        <div className="mb-3 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
          <div className="rounded-lg bg-slate-50 px-2.5 py-2">
            <p className="font-semibold text-slate-700">Published</p>
            <p className="mt-0.5">{formatDate(game.publishedAt)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-2.5 py-2">
            <p className="font-semibold text-slate-700">Audience</p>
            <p className="mt-0.5">Caregiver app</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {previewUrl ? (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                title="Open preview"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
            <button
              type="button"
              onClick={onEdit}
              title="Edit game"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              title="Delete game"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onTogglePublish}
            disabled={busy}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              game.isPublished
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : game.isPublished ? (
              <ExternalLink className="h-3.5 w-3.5" />
            ) : (
              <Gamepad2 className="h-3.5 w-3.5" />
            )}
            {game.isPublished ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>
    </article>
  );
}

function CreateGameModal({
  isOpen,
  loading,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  const [source, setSource] = useState<GameSourceFiltered>('UPLOADED');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const raw = new FormData(event.currentTarget);
    const payload = new FormData();
    payload.append('title', String(raw.get('title') ?? '').trim());
    payload.append('description', String(raw.get('description') ?? '').trim());
    payload.append('source', source);
    payload.append('allowedRoleSlugs', 'CAREGIVER');

    const thumbnail = String(raw.get('thumbnail') ?? '').trim();
    if (thumbnail) payload.append('thumbnail', thumbnail);
    parseTags(raw.get('tags')).forEach((tag) => payload.append('tags', tag));

    if (source === 'EXTERNAL') {
      payload.append('externalUrl', String(raw.get('externalUrl') ?? '').trim());
    }

    if (source === 'UPLOADED') {
      if (selectedFile) payload.append('file', selectedFile);
    }

    onSubmit(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Add therapeutic game</h2>
            <p className="mt-1 text-xs text-slate-500">Publish games caregivers can launch from the mobile app.</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <Gamepad2 className="h-4 w-4" />
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-700">Title</label>
            <input
              name="title"
              required
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-50"
              placeholder="Reach & Match"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-700">Description</label>
            <textarea
              name="description"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-50"
              placeholder="Briefly describe the therapeutic goal and caregiver instructions."
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold text-slate-700">Source</label>
            <div className="grid grid-cols-2 gap-2">
              {SOURCE_OPTIONS.map((option) => {
                const Icon = option.value === 'UPLOADED' ? UploadCloud : Link2;
                const active = source === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSource(option.value);
                      setSelectedFile(null);
                    }}
                    className={`flex h-10 items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition ${
                      active
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {source === 'UPLOADED' ? (
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-700">Game file</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-emerald-300 hover:bg-emerald-50">
                <input
                  type="file"
                  className="hidden"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                />
                <UploadCloud className="h-6 w-6 text-slate-400" />
                <span className="mt-2 max-w-full truncate text-xs font-semibold text-slate-700">
                  {selectedFile ? selectedFile.name : 'Choose an HTML, zip, video, or app-supported game file'}
                </span>
              </label>
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-700">Game URL</label>
              <input
                type="url"
                name="externalUrl"
                required
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-50"
                placeholder="https://example.com/game"
              />
              <p className="mt-2 text-[11px] text-slate-400">Use a playable web game, YouTube, or externally hosted therapeutic activity URL.</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-700">Tags</label>
              <input
                name="tags"
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-50"
                placeholder="motor, balance, speech"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-700">Thumbnail URL</label>
              <input
                type="url"
                name="thumbnail"
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-50"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <Button type="submit" disabled={loading || (source === 'UPLOADED' && !selectedFile)}>
              {loading ? 'Creating...' : 'Create game'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function EditGameModal({
  game,
  loading,
  onClose,
  onSubmit,
}: {
  game: GameResource | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateGamePayload) => void;
}) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const raw = new FormData(event.currentTarget);
    onSubmit({
      title: String(raw.get('title') ?? '').trim(),
      description: String(raw.get('description') ?? '').trim(),
      thumbnail: String(raw.get('thumbnail') ?? '').trim(),
      tags: parseTags(raw.get('tags')),
      allowedRoleSlugs: ['CAREGIVER'],
    });
  };

  return (
    <Modal isOpen={!!game} onClose={onClose}>
      <div className="rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-950">Edit game</h2>
        <p className="mt-1 text-xs text-slate-500">Update caregiver-facing details and clinical tags.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-700">Title</label>
            <input
              name="title"
              required
              defaultValue={game?.title ?? ''}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-700">Description</label>
            <textarea
              name="description"
              rows={4}
              defaultValue={game?.description ?? ''}
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-50"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-700">Tags</label>
              <input
                name="tags"
                defaultValue={(game?.tags ?? []).join(', ')}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-50"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-700">Thumbnail URL</label>
              <input
                type="url"
                name="thumbnail"
                defaultValue={game?.thumbnail ?? ''}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default function ProviderGamesPage() {
  const { token } = useAuth();
  const [games, setGames] = useState<GameResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [editingGame, setEditingGame] = useState<GameResource | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!token) return;

    let active = true;
    const authToken = token;
    async function loadGames() {
      try {
        setLoading(true);
        setError('');
        const result = await getGames(authToken, { limit: 100 });
        if (active) setGames(result.games);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load games.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadGames();
    return () => {
      active = false;
    };
  }, [token]);

  const replaceGame = (nextGame: GameResource) => {
    setGames((current) => current.map((game) => (game.id === nextGame.id ? nextGame : game)));
  };

  const handleCreate = async (formData: FormData) => {
    if (!token) return;
    try {
      setSaving(true);
      setError('');
      const created = await createGame(formData, token);
      setGames((current) => [created, ...current]);
      setShowCreateModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (payload: UpdateGamePayload) => {
    if (!token || !editingGame) return;
    try {
      setSaving(true);
      setError('');
      const updated = await updateGame(editingGame.id, payload, token);
      replaceGame(updated);
      setEditingGame(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update game.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (game: GameResource) => {
    if (!token) return;
    try {
      setActionId(game.id);
      setError('');
      const updated = game.isPublished
        ? await unpublishGame(game.id, token)
        : await publishGame(game.id, token);
      replaceGame(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update publish status.');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (game: GameResource) => {
    if (!token || !confirm(`Delete "${game.title}"?`)) return;
    try {
      setActionId(game.id);
      setError('');
      await deleteGame(game.id, token);
      setGames((current) => current.filter((item) => item.id !== game.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete game.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 max-w-full flex-col overflow-hidden">
      <div className="mb-5 flex shrink-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Caregiver engagement</p>
          <h1 className="mt-1 text-[22px] font-bold tracking-tight text-slate-950">Games & Wellbeing</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Manage therapeutic games for caregivers, publish approved activities, and review patient-linked feedback from home practice.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Add game
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {loading ? (
          <GameSkeleton />
        ) : games.length === 0 ? (
          <EmptyState
            title="No games yet"
            description="Add your first therapeutic game so caregivers can begin structured home practice."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                busy={actionId === game.id}
                onEdit={() => setEditingGame(game)}
                onDelete={() => void handleDelete(game)}
                onTogglePublish={() => void handleTogglePublish(game)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateGameModal
        isOpen={showCreateModal}
        loading={saving}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(formData) => void handleCreate(formData)}
      />

      <EditGameModal
        key={editingGame?.id ?? 'no-game'}
        game={editingGame}
        loading={saving}
        onClose={() => setEditingGame(null)}
        onSubmit={(payload) => void handleEdit(payload)}
      />
    </div>
  );
}
