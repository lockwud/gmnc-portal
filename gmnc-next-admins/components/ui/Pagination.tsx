'use client';

import React from 'react';

type Props = {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (p: number) => void;
  onPageSizeChange?: (size: number) => void;
};

const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M15 6L9 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Pagination: React.FC<Props> = ({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const prev = () => onPageChange(Math.max(1, page - 1));
  const next = () => onPageChange(Math.min(totalPages, page + 1));

  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (page > 4) pages.push('...');

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (page < totalPages - 3) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-between border-t bg-white px-4 py-3">
      <div className="text-sm text-gray-600">
        Showing {startItem} - {endItem} of {totalItems}
      </div>

      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Rows:
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="ml-1 rounded-full border px-2 py-1 text-sm"
              aria-label="Rows per page"
            >
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        )}

        <button
          onClick={prev}
          disabled={page === 1}
          className="flex items-center justify-center rounded-full border px-2 py-1 text-sm disabled:opacity-50"
          aria-label="Previous page"
        >
          <ChevronLeft />
        </button>

        <nav className="flex items-center gap-2" aria-label="Pagination">
          {pages.map((p, idx) =>
            p === '...' ? (
              <div key={`dots-${idx}`} className="px-2 text-sm text-gray-400">
                …
              </div>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(Number(p))}
                className={
                  p === page
                    ? 'flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm text-white'
                    : 'flex h-8 w-8 items-center justify-center rounded-full border bg-white text-sm text-gray-700 hover:bg-gray-50'
                }
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Go to page ${p}`}
              >
                {p}
              </button>
            )
          )}
        </nav>

        <button
          onClick={next}
          disabled={page === totalPages}
          className="flex items-center justify-center rounded-full border px-2 py-1 text-sm disabled:opacity-50"
          aria-label="Next page"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;