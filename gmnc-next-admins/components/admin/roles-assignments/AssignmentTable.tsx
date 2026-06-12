import React from 'react';
import RowActions from '@/components/ui/RowActions';
import { UserAssignmentRecord } from '@/lib/api/types';
import RoleScopeBadge from '@/components/admin/roles-access/RoleScopeBadge';
import { formatDate } from '@/utils/role-access';

interface AssignmentTableProps {
  assignments: UserAssignmentRecord[];
  onRevokeRole?: (assignment: UserAssignmentRecord) => void;
}

export default function AssignmentTable({ assignments, onRevokeRole }: AssignmentTableProps) {
  return (
    <div className="min-h-0 flex-1 overflow-hidden border border-slate-200 bg-white">
      <div className="h-full overflow-auto scrollbar-none">
        <table className="w-full min-w-255 border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-emerald-600 text-white">
              <th className="px-4 py-3 text-left text-[11px] font-medium">User</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium">Role</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium">Scope</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium">Granted</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium">Status</th>
              <th className="px-4 py-3 text-center text-[11px] font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {assignments.map((assignment, index) => (
              <tr
                key={assignment.id}
                className={`transition ${
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                } hover:bg-emerald-50`}
              >
                <td className="border-b border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{assignment.userName}</p>
                    <p className="mt-1 text-xs text-slate-500">{assignment.email}</p>
                  </div>
                </td>

                <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                  {assignment.roleName}
                </td>

                <td className="border-b border-slate-100 px-4 py-3">
                  <RoleScopeBadge scope={assignment.scopeType} />
                </td>

                <td className="border-b border-slate-100 px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                  {formatDate(assignment.grantedAt)}
                </td>

                <td className="border-b border-slate-100 px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      assignment.active
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                        : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                    }`}
                  >
                    {assignment.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>

                <td
                  className="border-b border-slate-100 px-4 py-3 text-center"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="flex justify-center">
                    <RowActions
                      hideEdit
                      onDelete={() => onRevokeRole?.(assignment)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
