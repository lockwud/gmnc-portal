'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

type LogFile = { name: string; size: number; modifiedAt: string };

async function apiCall(path: string, token: string | null, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { message?: string }).message ?? `Request failed (${res.status})`);
  }
  return (data as { data?: unknown }).data ?? data;
}

/**
 * Admin audit + logs. File list and viewer proxy /admin/logs; the SQL runner
 * targets SELECT-only /admin/logs/query (row-capped at 200, audit-logged
 * server-side — every query runs under your admin identity). HTTP-triggered
 * migrations are disabled server-side by default, so there is no run button.
 */
export default function AdminAuditRoute() {
  return (
    <ProtectedRoute requiredRole={['admin']}>
      <AuditPage />
    </ProtectedRoute>
  );
}

function AuditPage() {
  const { token } = useAuth();
  const { show } = useToast();
  const [files, setFiles] = useState<LogFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [query, setQuery] = useState('SELECT id, "fullName", email, "userType" FROM "user" LIMIT 20');
  const [queryResult, setQueryResult] = useState<{ rows: unknown[]; truncated: boolean; maxRows: number } | null>(null);
  const [runningQuery, setRunningQuery] = useState(false);

  useEffect(() => {
    let active = true;
    apiCall('/api/admin/logs', token, { method: 'GET' })
      .then((data) => {
        if (!active) return;
        const list = (data as { files?: LogFile[] })?.files ?? [];
        setFiles(list);
        if (list.length > 0) setSelectedFile(list[0].name);
      })
      .catch((error) => {
        if (active) show({ type: 'error', title: 'Logs unavailable', message: error instanceof Error ? error.message : 'Failed to list log files' });
      })
      .finally(() => { if (active) setLoadingFiles(false); });
    return () => { active = false; };
  }, [token, show]);

  useEffect(() => {
    if (!selectedFile) return;
    let active = true;
    async function loadContent() {
      setLoadingContent(true);
      try {
        const data = await apiCall(`/api/admin/logs/${encodeURIComponent(selectedFile)}?tail=200`, token, { method: 'GET' });
        if (!active) return;
        const payload = data as { content?: string };
        setContent(typeof payload.content === 'string' ? payload.content : JSON.stringify(data, null, 2));
      } catch (error) {
        if (active) show({ type: 'error', title: 'Read failed', message: error instanceof Error ? error.message : 'Failed to read log file' });
      } finally {
        if (active) setLoadingContent(false);
      }
    }
    void loadContent();
    return () => { active = false; };
  }, [selectedFile, token, show]);

  const runQuery = async () => {
    if (!query.trim()) return;
    try {
      setRunningQuery(true);
      setQueryResult(null);
      const data = await apiCall('/api/admin/logs/query', token, {
        method: 'POST',
        body: JSON.stringify({ query }),
      }) as { result?: unknown[]; truncated?: boolean; maxRows?: number };
      setQueryResult({
        rows: Array.isArray(data.result) ? data.result : [],
        truncated: data.truncated === true,
        maxRows: typeof data.maxRows === 'number' ? data.maxRows : 200,
      });
    } catch (error) {
      show({ type: 'error', title: 'Query failed', message: error instanceof Error ? error.message : 'Query failed' });
    } finally {
      setRunningQuery(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-white px-6 py-5">
      <header className="mb-5">
        <h1 className="text-lg font-black text-slate-950">Audit & Logs</h1>
        <p className="mt-1 text-xs text-slate-500">
          Server log files and read-only SQL (SELECT only, capped at 200 rows, every query audit-logged under your admin identity).
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-black text-slate-900">Log files</h2>
          {loadingFiles ? (
            <p className="mt-3 text-xs text-slate-500">Loading…</p>
          ) : files.length === 0 ? (
            <p className="mt-3 text-xs text-slate-500">No log files available.</p>
          ) : (
            <ul className="mt-3 space-y-1">
              {files.map((file) => (
                <li key={file.name}>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(file.name)}
                    className={`w-full truncate rounded-md px-3 py-2 text-left text-xs font-semibold transition ${selectedFile === file.name ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                  >
                    {file.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <main className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-black text-slate-900">
              {selectedFile || 'Select a file'}
            </h2>
            <pre className="mt-3 max-h-[320px] overflow-auto rounded-md bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-slate-100">
              {loadingContent ? 'Loading…' : content || 'No content.'}
            </pre>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-black text-slate-900">Read-only SQL query</h2>
            <p className="mt-1 text-xs text-slate-500">SELECT/EXPLAIN only. Results are capped and your identity is logged with every execution.</p>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
              spellCheck={false}
              className="mt-3 w-full rounded-md border border-slate-200 bg-slate-950 p-3 font-mono text-xs text-slate-100 outline-none focus:border-[var(--color-brand)]"
            />
            <button
              type="button"
              onClick={() => void runQuery()}
              disabled={runningQuery || !query.trim()}
              className="mt-3 inline-flex h-9 items-center rounded-md px-4 text-xs font-bold text-white transition disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              {runningQuery ? 'Running…' : 'Run query'}
            </button>
            {queryResult ? (
              <div className="mt-3">
                <p className="text-xs text-slate-500">
                  {queryResult.rows.length} row{queryResult.rows.length === 1 ? '' : 's'}
                  {queryResult.truncated ? ` (truncated at server cap of ${queryResult.maxRows})` : ''}.
                </p>
                <pre className="mt-2 max-h-[320px] overflow-auto rounded-md bg-slate-50 p-3 font-mono text-[11px] text-slate-800">
                  {JSON.stringify(queryResult.rows, null, 2)}
                </pre>
              </div>
            ) : null}
          </section>
        </main>
      </div>
    </div>
  );
}
