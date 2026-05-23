'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, FileUp, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { getResources, createResource, updateResource, deleteResource } from '@/lib/api/resources';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import type { ResourceType } from '@/lib/api/types';

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

                {resource.type && (
                  <span className="inline-block mt-2 text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                    {resource.type}
                  </span>
                )}
              </div>
            ))}
          </div>
      )}

      <CreateResourceModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        loading={createLoading}
      />

      <EditResourceModal 
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
  const [type, setType] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
            <select 
              name="type" 
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Select type</option>
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
            </select>
          </div>
          {type === 'document' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">File (PDF)</label>
              <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center">
                <input
                  type="file"
                  name="file"
                  accept=".pdf"
                  className="hidden"
                  id="file-input-create"
                />
                <label htmlFor="file-input-create" className="cursor-pointer flex flex-col items-center gap-2">
                  <FileUp className="h-6 w-6 text-slate-400" />
                  <span className="text-[11px] text-slate-500">Click to upload PDF</span>
                </label>
              </div>
            </div>
          )}
          {type === 'video' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">File (Video)</label>
              <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center">
                <input
                  type="file"
                  name="file"
                  accept="video/*"
                  className="hidden"
                  id="file-input-create"
                />
                <label htmlFor="file-input-create" className="cursor-pointer flex flex-col items-center gap-2">
                  <FileUp className="h-6 w-6 text-slate-400" />
                  <span className="text-[11px] text-slate-500">Click to upload video</span>
                </label>
              </div>
            </div>
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
  const [type, setType] = useState(resource?.type || '');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
            <select 
              name="type" 
              defaultValue={resource?.type || ''}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Select type</option>
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
            </select>
          </div>
          {type === 'document' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">File (PDF)</label>
              <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center">
                <input
                  type="file"
                  name="file"
                  accept=".pdf"
                  className="hidden"
                  id="file-input-edit"
                />
                <label htmlFor="file-input-edit" className="cursor-pointer flex flex-col items-center gap-2">
                  <FileUp className="h-6 w-6 text-slate-400" />
                  <span className="text-[11px] text-slate-500">Click to upload PDF</span>
                </label>
              </div>
            </div>
          )}
          {type === 'video' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">File (Video)</label>
              <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center">
                <input
                  type="file"
                  name="file"
                  accept="video/*"
                  className="hidden"
                  id="file-input-edit"
                />
                <label htmlFor="file-input-edit" className="cursor-pointer flex flex-col items-center gap-2">
                  <FileUp className="h-6 w-6 text-slate-400" />
                  <span className="text-[11px] text-slate-500">Click to upload video</span>
                </label>
              </div>
            </div>
          )}
          {type === 'link' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">URL</label>
              <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center">
                <input
                  type="url"
                  name="url"
                  defaultValue={resource?.url || ''}
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