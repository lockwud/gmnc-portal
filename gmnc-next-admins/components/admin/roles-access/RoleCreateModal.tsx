'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import RoleFilterDropdown from '@/components/admin/roles-access/RoleFilterDropdown';
import { AssignmentScopeType } from '@/lib/api/types';

interface RoleCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleData: { name: string; description?: string; scopeType: AssignmentScopeType }) => Promise<void>;
}

export default function RoleCreateModal({
  isOpen,
  onClose,
  onSave,
}: RoleCreateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scopeType, setScopeType] = useState<AssignmentScopeType>('GLOBAL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Role name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        scopeType,
      });

      // Reset form
      setName('');
      setDescription('');
      setScopeType('GLOBAL');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-1 text-base font-semibold text-slate-900">Create role</h2>
        <p className="mb-6 text-xs text-slate-500">Add a new application role and assign permissions later.</p>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Role Name */}
          <div>
            <label htmlFor="roleName" className="block text-xs font-medium text-slate-700 mb-2">
              Role name
            </label>
            <input
              id="roleName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g., Support Agent, Editor"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50"
            />
          </div>

          {/* Description - Single line input */}
          <div>
            <label htmlFor="description" className="block text-xs font-medium text-slate-700 mb-2">
              Description
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              placeholder="Optional description for this role"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50"
            />
          </div>

          {/* Scope Type - Using RoleFilterDropdown */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">
              Scope
            </label>
            <RoleFilterDropdown
              value={scopeType}
              options={[
                { value: 'GLOBAL', label: 'Global' },
                { value: 'ORGANIZATION', label: 'Organization' },
                { value: 'SERVICE_PROVIDER', label: 'Service provider' },
                { value: 'COMMUNITY', label: 'Community' },
              ]}
              onChange={(value) => setScopeType(value as AssignmentScopeType)}
              ariaLabel="Select role scope"
              widthClass="w-full"
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-2 justify-end">
            <Button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-full hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save role'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}