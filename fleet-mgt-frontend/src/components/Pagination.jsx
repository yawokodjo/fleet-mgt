import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Pagination({ currentPage, lastPage, total, perPage, from, to, onPageChange, onPerPageChange, perPageOptions = [10, 15, 25, 50] }) {
  const { t } = useTranslation();

  if (lastPage <= 1 && total <= perPageOptions[0]) return null;

  const pages = buildPageList(currentPage, lastPage);

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
      <div className="d-flex align-items-center gap-2">
        <small className="text-muted">
          {t('common.pagination_showing', { from: from ?? 0, to: to ?? 0, total: total ?? 0 })}
        </small>
        {onPerPageChange && (
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
          >
            {perPageOptions.map(n => (
              <option key={n} value={n}>{n} / {t('common.per_page')}</option>
            ))}
          </select>
        )}
      </div>

      {lastPage > 1 && (
        <nav>
          <ul className="pagination pagination-sm mb-0 flex-wrap">
            <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => onPageChange(currentPage - 1)}>
                ‹ {t('common.previous')}
              </button>
            </li>

            {pages.map((p, i) =>
              p === '...' ? (
                <li key={`ellipsis-${i}`} className="page-item disabled">
                  <span className="page-link">…</span>
                </li>
              ) : (
                <li key={p} className={`page-item${p === currentPage ? ' active' : ''}`}>
                  <button className="page-link" onClick={() => onPageChange(p)}>{p}</button>
                </li>
              )
            )}

            <li className={`page-item${currentPage === lastPage ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => onPageChange(currentPage + 1)}>
                {t('common.next')} ›
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

function buildPageList(current, last) {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

  const pages = [];
  pages.push(1);

  if (current > 4) pages.push('...');

  const start = Math.max(2, current - 2);
  const end = Math.min(last - 1, current + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < last - 3) pages.push('...');
  pages.push(last);

  return pages;
}
