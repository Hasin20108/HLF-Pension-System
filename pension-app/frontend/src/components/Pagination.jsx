import React from "react";

export const Pagination = ({ t, currentPage, pageCount, pageSize, onPageChange, onPageSizeChange }) => {
    if (pageCount <= 1) return null;
    return (
        <div className="pagination">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>{t('prev')}</button>
            <span>{t('page')} {currentPage} {t('of')} {pageCount}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === pageCount}>{t('next')}</button>
            <select value={pageSize} onChange={e => onPageSizeChange(e.target.value)}>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
            </select>
            <label>{t('rowsPerPage')}</label>
        </div>
    );
};
784