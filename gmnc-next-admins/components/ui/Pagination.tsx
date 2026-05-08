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

const Pagination: React.FC<Props> = ({ page, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange }) => {
  const prev = () => onPageChange(Math.max(1, page - 1));
  const next = () => onPageChange(Math.min(totalPages, page + 1));

  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  // simple page list generation with ellipsis
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    // always show first, last, and neighbors around current
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
    <div className="flex items-center justify-between px-4 py-3 border-t bg-white rounded-b-lg">
      <div className="text-sm text-gray-600">
        Showing {startItem} - {endItem} of {totalItems}
      </div>

      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <label className="text-sm text-gray-600 flex items-center gap-2">
            Rows:
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="ml-1 px-2 py-1 border rounded-full text-sm"
              aria-label="Rows per page"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </label>
        )}

        <button
          onClick={prev}
          disabled={page === 1}
          className="px-2 py-1 rounded-full border text-sm disabled:opacity-50 flex items-center justify-center"
          aria-label="Previous page"
        >
          <ChevronLeft />
        </button>

        <nav className="flex items-center gap-2" aria-label="Pagination">
          {pages.map((p, idx) =>
            p === '...' ? (
              <div key={`dots-${idx}`} className="px-2 text-sm text-gray-400">…</div>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(Number(p))}
                className={
                  p === page
                    ? 'w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm'
                    : 'w-8 h-8 rounded-full border text-sm text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center'
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
          className="px-2 py-1 rounded-full border text-sm disabled:opacity-50 flex items-center justify-center"
          aria-label="Next page"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;