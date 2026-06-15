'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

type LogEntry = {
  time: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
};

type LogFile = {
  name: string;
  size: number;
  modifiedAt: string;
};

type EnvPreset = {
  label: string;
  apiUrl: string;
};

const ENV_PRESETS: Record<string, EnvPreset> = {
  local: { label: 'Local', apiUrl: 'http://localhost:3001' },
  production: { label: 'Production', apiUrl: 'https://api.getmyneurocare.org' },
};

function statusBadge(status: number) {
  if (status < 300) return 'success';
  if (status < 500) return 'warning';
  return 'error';
}

export default function E2ETestPage() {
  const [envKey, setEnvKey] = useState<string>('local');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [logContent, setLogContent] = useState<string>('');
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [tailLines, setTailLines] = useState<number>(200);
  const [runResult, setRunResult] = useState<string>('');
  const [adminToken, setAdminToken] = useState<string>('');
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loggingIn, setLoggingIn] = useState(false);

  // New state
  const [darkMode, setDarkMode] = useState(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [liveStreaming, setLiveStreaming] = useState(false);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [migrating, setMigrating] = useState(false);
  const [migrationLogs, setMigrationLogs] = useState<LogEntry[]>([]);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const liveLogsEndRef = useRef<HTMLDivElement>(null);
  const liveEventSourceRef = useRef<EventSource | null>(null);
  const migrationEndRef = useRef<HTMLDivElement>(null);

  const apiBase = ENV_PRESETS[envKey]?.apiUrl || API_BASE;

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { time, message, type }]);
  };

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
  };

  const fetchLogFiles = async () => {
    try {
      const res = await fetch(`${apiBase}/admin/logs`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        const files: LogFile[] = (data?.data?.files || []).map((file: any) => ({
          name: file.name,
          size: file.size,
          modifiedAt: file.modifiedAt,
        }));
        setLogFiles(files);
        setSelectedLog((prev) => {
          if (prev && files.some((f) => f.name === prev)) return prev;
          if (files.length > 0) return files[0].name;
          return null;
        });
        addLog(`Loaded ${files.length} log files`, 'success');
      } else {
        addLog(`Failed to load log files: ${res.status}`, 'warning');
      }
    } catch (error) {
      addLog(`Error loading log files: ${error instanceof Error ? error.message : JSON.stringify(error)}`, 'error');
    }
  };

  const fetchLogContent = async (filename: string) => {
    setLoadingLogs(true);
    try {
      let url = `${apiBase}/admin/logs/${encodeURIComponent(filename)}?tail=${tailLines}`;
      if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
      if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
      const res = await fetch(url, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setLogContent(data?.data?.content || '');
        addLog(`Loaded log: ${filename}`, 'success');
      } else {
        setLogContent(`Failed to load log: ${res.status}`);
        addLog(`Failed to load log ${filename}: ${res.status}`, 'warning');
      }
    } catch (error) {
      setLogContent(`Error: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      addLog(`Error loading log ${filename}`, 'error');
    } finally {
      setLoadingLogs(false);
    }
  };

  const startLiveStream = () => {
    if (liveStreaming) return;
    setLiveStreaming(true);
    setLiveLogs([]);

    const url = `${apiBase}/admin/logs/stream/live`;
    const token = adminToken;

    // Use fetch to connect to SSE since EventSource doesn't support custom headers
    const controller = new AbortController();
    const signal = controller.signal;

    const connect = async () => {
      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
        });

        if (!response.ok) {
          addLog(`Live stream connection failed: ${response.status}`, 'error');
          setLiveStreaming(false);
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          addLog('Live stream: no response body', 'error');
          setLiveStreaming(false);
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'connected') {
                  addLog('Live log stream connected', 'success');
                } else if (data.type === 'file' || data.type === 'append') {
                  setLiveLogs((prev) => {
                    const newLogs = data.content.split('\n').filter((l: string) => l.trim());
                    return [...prev, ...newLogs];
                  });
                }
              } catch {
                // ignore parse errors in stream
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          addLog(`Live stream error: ${err.message}`, 'error');
        }
      } finally {
        setLiveStreaming(false);
      }
    };

    connect();

    // Store abort controller for cleanup
    (window as any).__liveStreamAbort = controller;

    // Cleanup on unmount handled by effect return
  };

  const stopLiveStream = () => {
    const controller = (window as any).__liveStreamAbort;
    if (controller) {
      controller.abort();
      delete (window as any).__liveStreamAbort;
    }
    setLiveStreaming(false);
    addLog('Live log stream stopped', 'info');
  };

  // Cleanup live stream on unmount
  useEffect(() => {
    return () => {
      const controller = (window as any).__liveStreamAbort;
      if (controller) {
        controller.abort();
      }
    };
  }, []);

  const runMigrations = async () => {
    if (migrating) return;
    setMigrating(true);
    setMigrationLogs([]);

    const addMigrationLog = (message: string, type: LogEntry['type'] = 'info') => {
      const time = new Date().toLocaleTimeString();
      setMigrationLogs((prev) => [...prev, { time, message, type }]);
    };

    addMigrationLog('Starting database migration...', 'info');

    try {
      const response = await fetch(`${apiBase}/admin/logs/migrate`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        addMigrationLog(`Migration request failed: ${response.status}`, 'error');
        setMigrating(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        addMigrationLog('Migration: no response body', 'error');
        setMigrating(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              let msg = data.message || '';
              if (data.output) msg += '\n' + data.output;
              addMigrationLog(msg, data.type === 'error' ? 'error' : data.type === 'success' ? 'success' : 'info');
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch (error: any) {
      addMigrationLog(`Migration error: ${error.message}`, 'error');
    } finally {
      setMigrating(false);
    }
  };

  const check = async (label: string, req: () => Promise<Response>) => {
    addLog(`Checking ${label}...`, 'info');
    try {
      const res = await req();
      addLog(`${label}: ${res.status}`, statusBadge(res.status));
      return res;
    } catch (error) {
      addLog(`${label} error: ${error instanceof Error ? error.message : JSON.stringify(error)}`, 'error');
      return null;
    }
  };

  const handleLogin = async () => {
    setLoggingIn(true);
    setAdminToken('');
    addLog('Logging in...', 'info');
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      addLog(`Login: ${res.status}`, statusBadge(res.status));
      if (res.ok) {
        const loginData = await res.json();
        const token = loginData?.data?.accessToken || loginData?.accessToken || loginData?.token || '';
        if (token) {
          setAdminToken(token);
          addLog('Session started', 'success');
        } else {
          addLog('Login succeeded but token missing', 'warning');
        }
      }
    } catch (error) {
      addLog(`Login error: ${error instanceof Error ? error.message : JSON.stringify(error)}`, 'error');
    } finally {
      setLoggingIn(false);
    }
  };

  const runTest = async () => {
    setRunning(true);
    setLogs([]);
    setRunResult('');
    addLog('Starting GCPR clinical workflow sanity check...', 'info');
    addLog(`Backend: ${apiBase}`, 'info');

    try {
      await check('Backend health', () => fetch(`${apiBase}/`, { method: 'GET', cache: 'no-store' }));

      const loginRes = await check('Admin login', () =>
        fetch(`${apiBase}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password }),
          cache: 'no-store',
        }),
      );

      let token = adminToken;
      if (loginRes?.ok && !token) {
        try {
          const loginData = await loginRes.json();
          token = loginData?.data?.accessToken || loginData?.accessToken || loginData?.token || '';
          if (token) {
            setAdminToken(token);
            addLog('Admin token received', 'success');
          }
        } catch {
          addLog('Login response parse failed', 'warning');
        }
      }

      const authHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      await check('Admin providers', () =>
        fetch(`${apiBase}/admin/providers?limit=10`, {
          headers: authHeaders,
          cache: 'no-store',
        }),
      );

      await check('Assessment tools', () =>
        fetch(`${apiBase}/assessment/tools`, {
          headers: authHeaders,
          cache: 'no-store',
        }),
      );

      await check('Support tickets', () =>
        fetch(`${apiBase}/support/tickets`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            subject: 'E2E Browser Test Ticket',
            description: 'Automated support ticket from browser E2E test',
            message: 'Automated support ticket from browser E2E test',
            priority: 'MEDIUM',
            category: 'TECHNICAL',
          }),
          cache: 'no-store',
        }),
      );

      await check('Patients list', () =>
        fetch(`${apiBase}/cp-patient?page=1&limit=20`, {
          headers: authHeaders,
          cache: 'no-store',
        }),
      );

      setRunResult('Run complete. Review logs and backend panels.');
      addLog('Completed:', 'success');
    } catch (error) {
      addLog(`Run error: ${error instanceof Error ? error.message : JSON.stringify(error)}`, 'error');
      setRunResult('Run ended with an error.');
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    fetchLogFiles();
  }, [apiBase, adminToken]);

  useEffect(() => {
    if (selectedLog) {
      fetchLogContent(selectedLog);
    }
  }, [selectedLog, tailLines, apiBase, adminToken, startDate, endDate]);

  // Auto-scroll for live logs
  useEffect(() => {
    liveLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveLogs]);

  // Auto-scroll for migration logs
  useEffect(() => {
    migrationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [migrationLogs]);

  const containerClass = darkMode
    ? 'min-h-screen bg-slate-950 text-slate-100 p-6'
    : 'min-h-screen bg-white text-slate-900 p-6';

  const panelClass = darkMode
    ? 'rounded-xl border border-slate-800 bg-slate-900/60'
    : 'rounded-xl border border-slate-200 bg-white shadow-sm';

  const headerTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';
  const borderClass = darkMode ? 'border-slate-800' : 'border-slate-200';
  const inputClass = darkMode
    ? 'rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200'
    : 'rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900';
  const codeClass = darkMode ? 'text-emerald-400' : 'text-emerald-600';

  return (
    <div className={containerClass}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">GCPR E2E Runner</h1>
            <p className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Environment: <span className={darkMode ? 'text-slate-200' : 'text-slate-700'}>{ENV_PRESETS[envKey]?.label || envKey}</span> · Base URL:{' '}
              <code className={codeClass}>{apiBase}</code>
            </p>
          </div>
          {/* Dark/Light toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              darkMode
                ? 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
            <span>{darkMode ? 'Light' : 'Dark'}</span>
          </button>
        </div>

        {/* Environment selector */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(ENV_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => setEnvKey(key)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                  envKey === key
                    ? 'bg-emerald-600 text-white'
                    : darkMode
                      ? 'border border-slate-700 text-slate-200 hover:border-slate-500'
                      : 'border border-slate-300 text-slate-700 hover:border-slate-400'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Admin login */}
        <div className={`mb-6 ${panelClass} p-4`}>
          <p className={`mb-3 text-xs font-semibold uppercase tracking-widest ${headerTextClass}`}>Admin login</p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${headerTextClass}`}>Email or username</label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={inputClass}
                placeholder="identifier"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${headerTextClass}`}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="password"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loggingIn || !identifier || !password}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingIn ? 'Signing in...' : 'Sign in'}
            </button>
            {adminToken ? (
              <span className="text-xs text-emerald-400">Signed in</span>
            ) : (
              <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Not signed in</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={runTest}
            disabled={running}
            className="rounded-lg bg-emerald-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? 'Running...' : 'Run checks'}
          </button>
          <button
            onClick={() => setLogs([])}
            className={`rounded-lg border px-6 py-2.5 font-semibold transition-colors ${
              darkMode
                ? 'border-slate-700 text-slate-200 hover:border-slate-500'
                : 'border-slate-300 text-slate-700 hover:border-slate-400'
            }`}
          >
            Clear test logs
          </button>
          <button
            onClick={fetchLogFiles}
            className={`rounded-lg border px-6 py-2.5 font-semibold transition-colors ${
              darkMode
                ? 'border-slate-700 text-slate-200 hover:border-slate-500'
                : 'border-slate-300 text-slate-700 hover:border-slate-400'
            }`}
          >
            Refresh log files
          </button>

          {/* Live stream toggle */}
          <button
            onClick={liveStreaming ? stopLiveStream : startLiveStream}
            disabled={!adminToken}
            className={`rounded-lg px-6 py-2.5 font-semibold transition-colors ${
              liveStreaming
                ? 'bg-rose-600 text-white hover:bg-rose-500'
                : darkMode
                  ? 'border border-slate-700 text-slate-200 hover:border-slate-500'
                  : 'border border-slate-300 text-slate-700 hover:border-slate-400'
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {liveStreaming ? 'Stop live logs' : 'View live logs'}
          </button>

          {/* Run migrations */}
          <button
            onClick={runMigrations}
            disabled={migrating || !adminToken}
            className={`rounded-lg px-6 py-2.5 font-semibold transition-colors ${
              migrating
                ? 'bg-amber-600 text-white cursor-not-allowed opacity-60'
                : 'bg-violet-600 text-white hover:bg-violet-500'
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {migrating ? 'Migrating...' : 'Run migrations'}
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* E2E check output */}
          <div className={panelClass}>
            <div className={`border-b ${borderClass} px-4 py-2 flex items-center justify-between`}>
              <span className={`text-xs font-semibold uppercase tracking-widest ${headerTextClass}`}>E2E check output</span>
              <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{logs.length} entries</span>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              <pre className="font-mono text-xs leading-relaxed">
                {logs.length === 0 ? (
                  <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>Sign in and click "Run checks".</span>
                ) : (
                  // Show most recent logs first (reversed)
                  [...logs].reverse().map((log, idx) => (
                    <div key={idx} className="flex gap-3">
                      <span className={`shrink-0 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>[{log.time}]</span>
                      <span
                        className={
                          log.type === 'success'
                            ? 'text-emerald-400'
                            : log.type === 'error'
                              ? 'text-rose-400'
                              : log.type === 'warning'
                                ? 'text-amber-400'
                                : darkMode ? 'text-slate-200' : 'text-slate-800'
                        }
                      >
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </pre>
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Backend logs */}
          <div className={panelClass}>
            <div className={`border-b ${borderClass} px-4 py-2 flex items-center justify-between gap-4`}>
              <span className={`text-xs font-semibold uppercase tracking-widest ${headerTextClass}`}>Backend logs</span>
              <div className="flex items-center gap-3">
                <select
                  value={selectedLog || ''}
                  onChange={(e) => setSelectedLog(e.target.value)}
                  disabled={logFiles.length === 0}
                  className={inputClass + ' disabled:opacity-50'}
                >
                  {logFiles.length === 0 ? (
                    <option value="">No log files</option>
                  ) : (
                    logFiles.map((file) => (
                      <option key={file.name} value={file.name}>
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </option>
                    ))
                  )}
                </select>
                <select
                  value={tailLines}
                  onChange={(e) => setTailLines(Number(e.target.value))}
                  className={inputClass}
                >
                  <option value={100}>Last 100 lines</option>
                  <option value={200}>Last 200 lines</option>
                  <option value={500}>Last 500 lines</option>
                  <option value={1000}>Last 1000 lines</option>
                  <option value={0}>Full file</option>
                </select>
              </div>
            </div>
            {/* Date range filters */}
            <div className={`border-b ${borderClass} px-4 py-2 flex items-center gap-3`}>
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${headerTextClass}`}>From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass + ' w-auto'}
              />
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${headerTextClass}`}>To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass + ' w-auto'}
              />
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {loadingLogs ? (
                <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading log...</div>
              ) : logContent ? (
                <pre className={`whitespace-pre-wrap break-words font-mono text-xs leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{logContent}</pre>
              ) : (
                <div className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {selectedLog ? 'No content loaded.' : 'Select a log file to view its contents.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live logs panel */}
        {liveStreaming && (
          <div className={`mb-6 ${panelClass}`}>
            <div className={`border-b ${borderClass} px-4 py-2 flex items-center justify-between`}>
              <span className={`text-xs font-semibold uppercase tracking-widest ${headerTextClass}`}>
                Live logs
                <span className="ml-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              </span>
              <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{liveLogs.length} entries</span>
            </div>
            <div className="max-h-[40vh] overflow-y-auto p-4">
              <pre className={`whitespace-pre-wrap break-words font-mono text-xs leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                {liveLogs.length === 0 ? (
                  <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>Waiting for log entries...</span>
                ) : (
                  liveLogs.map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))
                )}
              </pre>
              <div ref={liveLogsEndRef} />
            </div>
          </div>
        )}

        {/* Migration output panel */}
        {migrationLogs.length > 0 && (
          <div className={`mb-6 ${panelClass}`}>
            <div className={`border-b ${borderClass} px-4 py-2 flex items-center justify-between`}>
              <span className={`text-xs font-semibold uppercase tracking-widest ${headerTextClass}`}>
                Migration output
                {migrating && <span className="ml-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-amber-400" />}
              </span>
            </div>
            <div className="max-h-[40vh] overflow-y-auto p-4">
              <pre className="font-mono text-xs leading-relaxed">
                {migrationLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-3">
                    <span className={`shrink-0 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>[{log.time}]</span>
                    <span
                      className={
                        log.type === 'success'
                          ? 'text-emerald-400'
                          : log.type === 'error'
                            ? 'text-rose-400'
                            : log.type === 'warning'
                              ? 'text-amber-400'
                              : darkMode ? 'text-slate-200' : 'text-slate-800'
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))}
              </pre>
              <div ref={migrationEndRef} />
            </div>
          </div>
        )}

        {/* Run result */}
        {runResult && (
          <div className={`mb-6 rounded-lg p-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{runResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}