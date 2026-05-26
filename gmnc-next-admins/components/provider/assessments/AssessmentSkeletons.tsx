import React from 'react';

export function AssessmentToolListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </div>
  );
}

export function AssessmentFormSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-40 animate-pulse rounded-2xl bg-white" />
      ))}
    </div>
  );
}

export function AssessmentHistorySkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="mt-3 h-3 w-72 rounded bg-slate-100" />
          <div className="mt-2 h-3 w-56 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export function AssessmentHubRouteSkeleton() {
  return (
    <div className="flex h-[calc(100vh-76px)] min-h-0 overflow-hidden bg-white">
      <aside className="flex w-[320px] shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-56 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 h-10 animate-pulse rounded-xl bg-slate-100" />
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-3"
            >
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-36 rounded bg-slate-100" />
              <div className="mt-2 h-3 w-12 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-3 w-64 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-10 w-40 animate-pulse rounded-md bg-slate-100" />
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-slate-50 px-4 py-4">
          <AssessmentHistorySkeleton />
        </div>
      </main>
    </div>
  );
}

export function AssessmentCreateRouteSkeleton() {
  return (
    <div className="flex h-[calc(100vh-110px)] min-h-0 overflow-hidden bg-slate-50">
      <aside className="hidden w-[20.625rem] shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-200 px-4 py-4">
          <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-48 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
          <AssessmentToolListSkeleton />
        </div>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="h-8 w-14 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
              </div>
              <div className="mt-2 h-3 w-72 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="h-10 w-24 animate-pulse rounded-md bg-slate-100" />
              <div className="h-10 w-16 animate-pulse rounded-md bg-slate-100" />
              <div className="h-10 w-36 animate-pulse rounded-md bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
          <AssessmentFormSkeleton />
        </div>
      </main>
    </div>
  );
}

export function AssessmentReportRouteSkeleton() {
  return (
    <div className="flex h-[calc(100vh-76px)] min-h-0 flex-col overflow-hidden bg-white">
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-16 animate-pulse rounded-full bg-slate-100" />
            <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
          </div>
          <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="space-y-3">
            <div className="h-5 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
          </section>

          <section className="space-y-3">
            <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
