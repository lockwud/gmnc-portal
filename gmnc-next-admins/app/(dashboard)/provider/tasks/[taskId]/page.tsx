'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/context/AuthContext';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileText,
  ListChecks,
  User,
  Users,
  Video,
} from 'lucide-react';

type TaskStatus = 'ASSIGNED' | 'COMPLETED' | 'PENDING';

type TaskDetail = {
  id: string;
  patientId: string;
  providerId: string;
  referralId?: string | null;
  carePlanId?: string | null;
  title: string;
  instructions: string;
  instructionSteps?: string[] | null;
  frequencyPerDay?: number | null;
  frequencyNote?: string | null;
  durationDays: number;
  startDate?: string | null;
  endDate?: string | null;
  videoUrl?: string | null;
  progress: number;
  status: TaskStatus;
  completedDates?: string[];
  createdAt: string;
  updatedAt: string;
  patient?: { id: string; fullName: string; dateOfBirth?: string | null; gender?: string | null };
  provider?: {
    id: string;
    profession?: string | null;
    user?: { id: string; fullName: string; email?: string | null; phoneNumber?: string | null };
  };
  referral?: {
    id: string;
    status: string;
    reason?: string | null;
    toProfession?: string | null;
    fromProviderId: string;
    toProviderId?: string | null;
    patient?: { id: string; fullName: string };
    fromProvider?: { id: string; profession?: string | null; user?: { fullName: string; email?: string | null } };
    toProvider?: { id: string; profession?: string | null; user?: { fullName: string; email?: string | null } } | null;
    relatedAssessment?: { id: string; toolCode: string; status: string; assessedAt?: string | null } | null;
  } | null;
  carePlan?: {
    id: string;
    assessmentId: string;
    status: string;
    reviewDate?: string | null;
    goals?: unknown[];
    interventions?: unknown[];
    patient?: { id: string; fullName: string };
    primaryProvider?: { id: string; profession?: string | null; user?: { fullName: string; email?: string | null } };
    assessment?: { id: string; toolCode: string; status: string; assessedAt?: string | null };
    signatures?: Array<{ id: string; signerType?: string; signedAt?: string; signer?: { fullName: string; userType?: string } }>;
  } | null;
  adherenceLogs?: Array<{ id: string; logDate: string; status: string; markedAt?: string | null; notes?: string | null }>;
  participationLogs?: Array<{ id: string; activityName: string; participatedOn: string; durationMinutes?: number | null; outcome?: string | null }>;
};

const statusClass: Record<string, string> = {
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  ASSIGNED: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
  PENDING: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
};

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-b border-slate-200 bg-white px-6 py-5 last:border-b-0">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">{icon}</span>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 text-sm text-slate-700">{value || '-'}</div>
    </div>
  );
}

function renderJsonList(value: unknown[] | undefined) {
  if (!Array.isArray(value) || value.length === 0) return <p className="text-sm text-slate-500">No entries recorded.</p>;
  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div key={index} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {typeof item === 'string' ? item : JSON.stringify(item)}
        </div>
      ))}
    </div>
  );
}

function getEmbeddedVideoUrl(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const videoId = parsed.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (host === 'youtu.be') {
      const videoId = parsed.pathname.split('/').filter(Boolean)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (host === 'vimeo.com') {
      const videoId = parsed.pathname.split('/').filter(Boolean)[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
  } catch {
    return url;
  }
  return url;
}

function isDirectVideoUrl(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

export default function ProviderTaskDetailRoute() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const taskId = typeof params?.taskId === 'string' ? params.taskId : '';
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId || !token) return;
    let active = true;

    async function loadTask() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/assessment/tasks/${encodeURIComponent(taskId)}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payload?.message || 'Failed to load task details');
        }
        if (!active) return;
        setTask((payload?.data ?? payload?.task ?? payload) as TaskDetail);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load task details');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadTask();
    return () => { active = false; };
  }, [taskId, token]);

  const completedCount = task?.completedDates?.length ?? 0;
  const progressColor = useMemo(() => {
    const progress = task?.progress ?? 0;
    if (progress >= 75) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-amber-500';
    return 'bg-rose-500';
  }, [task?.progress]);

  return (
    <ProtectedRoute requiredRole={["admin", "provider"]}>
      <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-slate-50">
        <div className="border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/provider/tasks')}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                aria-label="Back to tasks"
              >
                <ArrowLeft size={15} />
              </button>
              <div className="min-w-0">
                <p className="text-xs text-slate-400">Rehab task detail</p>
                <h1 className="truncate text-[17px] font-semibold text-slate-900">{task?.title ?? 'Task details'}</h1>
              </div>
            </div>
            <div />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-white px-4 py-5">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            </div>
          ) : error || !task ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {error ?? 'Task not found.'}
            </div>
          ) : (
            <div className="grid min-h-full w-full bg-white lg:grid-cols-[1.7fr_1fr]">
              <div className="border-r border-slate-200">
                <section className="border-b border-slate-200 bg-white">
                  <div className="bg-emerald-600 px-6 py-6 text-white">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-emerald-100">Task</p>
                        <h2 className="mt-1 text-2xl font-semibold">{task.title}</h2>
                        <p className="mt-2 max-w-3xl text-sm text-emerald-50">{task.instructions}</p>
                      </div>
                      <span className={`rounded-full bg-white px-3 py-1 text-xs font-medium ${statusClass[task.status] ?? statusClass.PENDING}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-4 px-6 py-5 md:grid-cols-4">
                    <Field label="Patient" value={task.patient?.fullName} />
                    <Field label="Provider" value={task.provider?.user?.fullName ?? task.provider?.profession} />
                    <Field label="Duration" value={`${task.durationDays} days`} />
                    <Field label="Created" value={formatDate(task.createdAt)} />
                  </div>
                </section>

                <Section title="Progress & Schedule" icon={<ClipboardList size={15} />}>
                  <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">Completion progress</span>
                        <span className="font-semibold text-slate-900">{task.progress}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${task.progress}%` }} />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{completedCount}/{task.durationDays} days completed</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <Field label="Frequency" value={task.frequencyPerDay ? `${task.frequencyPerDay}x/day` : '-'} />
                      <Field label="Start" value={formatDate(task.startDate)} />
                      <Field label="End" value={formatDate(task.endDate)} />
                      <Field label="Updated" value={formatDateTime(task.updatedAt)} />
                    </div>
                  </div>
                  {task.frequencyNote ? <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">{task.frequencyNote}</p> : null}
                </Section>

                <Section title="Instructions" icon={<FileText size={15} />}>
                  <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{task.instructions}</p>
                  {Array.isArray(task.instructionSteps) && task.instructionSteps.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      {task.instructionSteps.map((step, index) => (
                        <div key={index} className="flex gap-3 border border-slate-100 bg-slate-50 p-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">{index + 1}</span>
                          <p className="text-sm text-slate-700">{step}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </Section>

                <Section title="Care Plan" icon={<ListChecks size={15} />}>
                  {task.carePlan ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-4">
                        <Field label="Status" value={task.carePlan.status} />
                        <Field label="Assessment" value={task.carePlan.assessment?.toolCode ?? task.carePlan.assessmentId} />
                        <Field label="Review date" value={formatDate(task.carePlan.reviewDate)} />
                        <Field label="Primary provider" value={task.carePlan.primaryProvider?.user?.fullName ?? task.carePlan.primaryProvider?.profession} />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Goals</p>
                          {renderJsonList(task.carePlan.goals)}
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Interventions</p>
                          {renderJsonList(task.carePlan.interventions)}
                        </div>
                      </div>
                      {task.carePlan.signatures && task.carePlan.signatures.length > 0 ? (
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Signatures</p>
                          <div className="space-y-2">
                            {task.carePlan.signatures.map((signature) => (
                              <div key={signature.id} className="flex items-center justify-between border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                                <span className="text-slate-700">{signature.signer?.fullName ?? signature.signerType ?? 'Signer'}</span>
                                <span className="text-slate-500">{formatDateTime(signature.signedAt)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No care plan linked to this task.</p>
                  )}
                </Section>
              </div>

              <aside>
                <Section title="Patient" icon={<User size={15} />}>
                  <div className="space-y-3">
                    <Field label="Name" value={task.patient?.fullName} />
                    <Field label="Gender" value={task.patient?.gender} />
                    <Field label="Date of birth" value={formatDate(task.patient?.dateOfBirth)} />
                  </div>
                </Section>

                <Section title="Referral" icon={<Users size={15} />}>
                  {task.referral ? (
                    <div className="space-y-3">
                      <Field label="Status" value={task.referral.status} />
                      <Field label="From" value={task.referral.fromProvider?.user?.fullName ?? task.referral.fromProvider?.profession} />
                      <Field label="To" value={task.referral.toProvider?.user?.fullName ?? task.referral.toProfession} />
                      <Field label="Assessment" value={task.referral.relatedAssessment?.toolCode} />
                      <Field label="Reason" value={<p className="whitespace-pre-line">{task.referral.reason ?? '-'}</p>} />
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No referral linked to this task.</p>
                  )}
                </Section>

                <Section title="Adherence" icon={<CheckCircle2 size={15} />}>
                  {task.adherenceLogs && task.adherenceLogs.length > 0 ? (
                    <div className="max-h-80 space-y-2 overflow-auto pr-1">
                      {task.adherenceLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                          <span className="text-slate-700">{formatDate(log.logDate)}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${log.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{log.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No adherence logs recorded.</p>
                  )}
                </Section>

                <Section title="Participation" icon={<Calendar size={15} />}>
                  {task.participationLogs && task.participationLogs.length > 0 ? (
                    <div className="space-y-2">
                      {task.participationLogs.map((log) => (
                        <div key={log.id} className="border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-slate-700">{log.activityName}</span>
                            <span className="text-xs text-slate-500">{formatDate(log.participatedOn)}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{log.durationMinutes ? `${log.durationMinutes} minutes` : 'Duration not recorded'}{log.outcome ? ` | ${log.outcome}` : ''}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No participation logs recorded.</p>
                  )}
                </Section>

                {task.videoUrl ? (
                  <Section title="Instruction Video" icon={<Video size={15} />}>
                    <div className="overflow-hidden border border-slate-200 bg-slate-950">
                      {isDirectVideoUrl(task.videoUrl) ? (
                        <video controls className="aspect-video w-full bg-black" src={task.videoUrl}>
                          <track kind="captions" />
                        </video>
                      ) : (
                        <iframe
                          src={getEmbeddedVideoUrl(task.videoUrl)}
                          title="Instruction video"
                          className="aspect-video w-full bg-black"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      )}
                    </div>
                  </Section>
                ) : null}
              </aside>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
