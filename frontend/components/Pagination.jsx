'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Pagination({ currentPage, totalPages, totalElements }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageUrl = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let start = Math.max(0, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages);

    if (end - start < showPages) {
      start = Math.max(0, end - showPages);
    }

    for (let i = start; i < end; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-neutral-border">
      <p className="text-small text-neutral-muted">
        Showing {currentPage * 12 + 1} - {Math.min((currentPage + 1) * 12, totalElements)} of {totalElements} results
      </p>
      
      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* Previous */}
        <Link
          href={currentPage > 0 ? createPageUrl(currentPage - 1) : '#'}
          className={`p-2 rounded-button transition-colors ${
            currentPage > 0
              ? 'hover:bg-neutral-bg text-neutral-text'
              : 'opacity-50 cursor-not-allowed text-neutral-muted'
          }`}
          aria-disabled={currentPage === 0}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>

        {/* First page */}
        {pageNumbers[0] > 0 && (
          <>
            <Link
              href={createPageUrl(0)}
              className="w-10 h-10 rounded-button flex items-center justify-center text-small font-medium hover:bg-neutral-bg"
            >
              1
            </Link>
            {pageNumbers[0] > 1 && (
              <span className="px-2 text-neutral-muted">...</span>
            )}
          </>
        )}

        {/* Page numbers */}
        {pageNumbers.map((page) => (
          <Link
            key={page}
            href={createPageUrl(page)}
            className={`w-10 h-10 rounded-button flex items-center justify-center text-small font-medium transition-colors ${
              page === currentPage
                ? 'bg-primary text-white shadow-button'
                : 'hover:bg-neutral-bg text-neutral-text'
            }`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page + 1}
          </Link>
        ))}

        {/* Last page */}
        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 2 && (
              <span className="px-2 text-neutral-muted">...</span>
            )}
            <Link
              href={createPageUrl(totalPages - 1)}
              className="w-10 h-10 rounded-button flex items-center justify-center text-small font-medium hover:bg-neutral-bg"
            >
              {totalPages}
            </Link>
          </>
        )}

        {/* Next */}
        <Link
          href={currentPage < totalPages - 1 ? createPageUrl(currentPage + 1) : '#'}
          className={`p-2 rounded-button transition-colors ${
            currentPage < totalPages - 1
              ? 'hover:bg-neutral-bg text-neutral-text'
              : 'opacity-50 cursor-not-allowed text-neutral-muted'
          }`}
          aria-disabled={currentPage >= totalPages - 1}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </Link>
      </nav>
    </div>
  );
}
