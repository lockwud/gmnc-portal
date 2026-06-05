'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ExternalLink,
  FileText,
  FileUp,
  Link as LinkIcon,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Video,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { getResources, createResource, updateResource, deleteResource } from '@/lib/api/resources';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import type { ResourceType } from '@/lib/api/types';

type ResourceKind = '' | 'document' | 'video' | 'link';

const RESOURCE_TYPE_OPTIONS: {
  value: Exclude<ResourceKind, ''>;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: 'document', label: 'Document', icon: FileText },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'link', label: 'Link', icon: LinkIcon },
];

function normalizeResourceType(type?: string | null): ResourceKind {
  const normalized = (type ?? '').trim().toLowerCase();
  if (normalized === 'document' || normalized === 'pdf') return 'document';
  if (normalized === 'video') return 'video';
  if (normalized === 'link' || normalized === 'url') return 'link';
  return '';
}

function getResourceUrl(resource: ResourceType): string {
  return resource.resourceUrl || resource.fileUrl || resource.url || '';
}

function getResourceKind(resource: ResourceType): ResourceKind {
  const kind = normalizeResourceType(resource.type);
  if (kind) return kind;

  const url = getResourceUrl(resource).toLowerCase();
  if (url.endsWith('.pdf')) return 'document';
  if (/\.(mp4|webm|ogg|mov|m4v)(\?|$)/.test(url)) return 'video';
  return url ? 'link' : '';
}

function getTypeLabel(resource: ResourceType) {
  const kind = getResourceKind(resource);
  return RESOURCE_TYPE_OPTIONS.find((option) => option.value === kind)?.label ?? resource.type ?? 'Resource';
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function ResourcesSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="h-5 w-3/4 rounded bg-slate-200 mb-3" />
            <div className="h-3 w-1/2 rounded bg-slate-200 mb-4" />
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded bg-slate-200" />
              <div className="h-8 w-8 rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourcePreview({ resource }: { resource: ResourceType }) {
  const url = getResourceUrl(resource);
  const kind = getResourceKind(resource);
  const title = resource.title || resource.name || 'Resource preview';

  if (!url) {
    return (
      <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-[11px] text-slate-400">
        No file attached
      </div>
    );
  }

  if (kind === 'video') {
    return (
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
        <video
          src={url}
          controls
          preload="metadata"
          className="h-44 w-full bg-slate-950 object-contain"
        >
          <track kind="captions" />
        </video>
      </div>
    );
  }

  if (kind === 'document') {
    return (
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <iframe
          src={url}
          title={title}
          className="h-56 w-full bg-white"
        />
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
    >
      <span className="truncate">{url}</span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
    </a>
  );
}

function ResourceTypeDropdown({
  value,
  onChange,
}: {
  value: ResourceKind;
  onChange: (value: ResourceKind) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selected = RESOURCE_TYPE_OPTIONS.find((option) => option.value === value);
  const SelectedIcon = selected?.icon;

  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name="type" value={value} />
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-9 w-full items-center justify-between rounded-xl border bg-white px-3 text-[11px] font-medium transition ${
          open || selected
            ? 'border-emerald-300 text-slate-700 ring-2 ring-emerald-50'
            : 'border-slate-200 text-slate-400'
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {SelectedIcon ? (
            <SelectedIcon className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          ) : null}
          <span className="truncate">{selected?.label ?? 'Select'}</span>
        </span>
        <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400">
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          <div className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-medium text-emerald-700">
            Select
          </div>
          {RESOURCE_TYPE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] transition ${
                  active
                    ? 'bg-slate-100 font-semibold text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500">
                  <Icon className="h-2.5 w-2.5" />
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function FileUploadField({
  inputId,
  kind,
  loading,
  selectedFile,
  onFileChange,
  existingUrl,
}: {
  inputId: string;
  kind: Exclude<ResourceKind, '' | 'link'>;
  loading: boolean;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  existingUrl?: string;
}) {
  const isDocument = kind === 'document';
  const accept = isDocument ? '.pdf,application/pdf' : 'video/*';
  const label = isDocument ? 'File (PDF)' : 'File (Video)';
  const helper = isDocument ? 'Click to upload PDF' : 'Click to upload video';

  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-slate-700">{label}</label>
      <div className={`rounded-xl border border-dashed p-4 text-center transition ${
        selectedFile
          ? 'border-emerald-200 bg-emerald-50/60'
          : 'border-slate-300 bg-white'
      }`}>
        <input
          id={inputId}
          type="file"
          name="file"
          accept={accept}
          className="hidden"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
        <label htmlFor={inputId} className="flex cursor-pointer flex-col items-center gap-2">
          {loading && selectedFile ? (
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          ) : (
            <FileUp className="h-6 w-6 text-slate-400" />
          )}
          <span className="max-w-full truncate text-[11px] font-medium text-slate-600">
            {selectedFile ? selectedFile.name : helper}
          </span>
          {selectedFile ? (
            <span className="text-[10px] text-slate-400">
              {loading ? 'Uploading...' : formatFileSize(selectedFile.size)}
            </span>
          ) : existingUrl ? (
            <span className="max-w-full truncate text-[10px] text-slate-400">
              Existing file attached
            </span>
          ) : null}
        </label>
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  const { token } = useAuth();
  const [resources, setResources] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceType | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    
    const loadResources = async () => {
      try {
        setLoading(true);
        const data = await getResources(token);
        setResources(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadResources();
  }, [token]);

  const handleCreate = async (formData: FormData) => {
    if (!token) return;
    try {
      setCreateLoading(true);
      const newResource = await createResource(formData, token);
      setResources([newResource, ...resources]);
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = async (formData: FormData) => {
    if (!token || !editingResource) return;
    try {
      setUpdateLoading(true);
      const updatedResource = await updateResource(editingResource.id, formData, token);
      setResources(resources.map(r => r.id === editingResource.id ? updatedResource : r));
      setShowEditModal(false);
      setEditingResource(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this resource?')) return;
    try {
      await deleteResource(id, token);
      setResources(resources.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold tracking-tight text-slate-900">Documents</h1>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">Manage your documents</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Plus size={16} />
            </span>
            Create Resource
          </button>
        </div>
        <ResourcesSkeleton />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 max-w-full flex-col overflow-hidden">
      <div className="mb-4 flex shrink-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[18px] font-bold tracking-tight text-slate-900">Documents</h1>
          <p className="mt-1 flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">Manage your documents</p>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Plus size={16} />
          </span>
          Create Resource
        </button>
      </div>

      {resources.length === 0 ? (
        <EmptyState
          title="No documents found"
          description="Create your first document to get started."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
              <div key={resource.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-slate-900 truncate flex-1">{resource.name || resource.title || 'Unnamed Resource'}</h3>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => { setEditingResource(resource); setShowEditModal(true); }}
                      className="p-1.5 rounded text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(resource.id)}
                      className="p-1.5 rounded text-slate-500 hover:text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {resource.description && (
                  <p className="mt-2 text-[11px] text-slate-500 line-clamp-2">{resource.description}</p>
                )}

                <ResourcePreview resource={resource} />

                {resource.type && (
                  <span className="inline-block mt-2 text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                    {getTypeLabel(resource)}
                  </span>
                )}
              </div>
            ))}
          </div>
      )}

      <CreateResourceModal 
        key={showCreateModal ? 'create-open' : 'create-closed'}
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        loading={createLoading}
      />

      <EditResourceModal 
        key={`${editingResource?.id ?? 'no-resource'}-${showEditModal ? 'open' : 'closed'}`}
        isOpen={showEditModal} 
        onClose={() => { setShowEditModal(false); setEditingResource(null); }}
        onSubmit={handleEdit}
        resource={editingResource}
        loading={updateLoading}
      />
    </div>
  );
}

function CreateResourceModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  loading: boolean;
}) {
  const [type, setType] = useState<ResourceKind>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleTypeChange = (nextType: ResourceKind) => {
    setType(nextType);
    setSelectedFile(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Create Resource</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Name</label>
            <input
              name="name"
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
              placeholder="Resource name"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Title</label>
            <input
              name="title"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
              placeholder="Resource title"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none resize-none"
              placeholder="Resource description"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Type</label>
            <ResourceTypeDropdown value={type} onChange={handleTypeChange} />
          </div>
          {type === 'document' && (
            <FileUploadField
              inputId="file-input-create-document"
              kind="document"
              loading={loading}
              selectedFile={selectedFile}
              onFileChange={setSelectedFile}
            />
          )}
          {type === 'video' && (
            <FileUploadField
              inputId="file-input-create-video"
              kind="video"
              loading={loading}
              selectedFile={selectedFile}
              onFileChange={setSelectedFile}
            />
          )}
          {type === 'link' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">URL</label>
              <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center">
                <input
                  type="url"
                  name="url"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-slate-600 hover:text-slate-800 px-3 py-1"
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function EditResourceModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  resource,
  loading 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  resource: ResourceType | null;
  loading: boolean;
}) {
  const [type, setType] = useState<ResourceKind>(normalizeResourceType(resource?.type));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleTypeChange = (nextType: ResourceKind) => {
    setType(nextType);
    setSelectedFile(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Edit Resource</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Name</label>
            <input
              name="name"
              defaultValue={resource?.name || ''}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
              placeholder="Resource name"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Title</label>
            <input
              name="title"
              defaultValue={resource?.title || ''}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
              placeholder="Resource title"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={resource?.description || ''}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none resize-none"
              placeholder="Resource description"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Type</label>
            <ResourceTypeDropdown value={type} onChange={handleTypeChange} />
          </div>
          {type === 'document' && (
            <FileUploadField
              inputId="file-input-edit-document"
              kind="document"
              loading={loading}
              selectedFile={selectedFile}
              onFileChange={setSelectedFile}
              existingUrl={resource ? getResourceUrl(resource) : undefined}
            />
          )}
          {type === 'video' && (
            <FileUploadField
              inputId="file-input-edit-video"
              kind="video"
              loading={loading}
              selectedFile={selectedFile}
              onFileChange={setSelectedFile}
              existingUrl={resource ? getResourceUrl(resource) : undefined}
            />
          )}
          {type === 'link' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">URL</label>
              <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center">
                <input
                  type="url"
                  name="url"
                  defaultValue={resource ? getResourceUrl(resource) : ''}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-slate-600 hover:text-slate-800 px-3 py-1"
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
