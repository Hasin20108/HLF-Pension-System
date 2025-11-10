// Dashboard.js
import React from 'react';
import Navbar from '../components/Navbar'; // Ensure correct import path for Navbar
import { Tooltip, KpiCard, ToastContainer, LoadingOverlay} from "../components/ReusableComponents.jsx";
import Pagination from '../components/Pagination'; // Ensure correct import path for Pagination

const Dashboard = ({
  t,
  user,
  theme,
  language,
  loading,
  toasts,
  dismissToast,
  kpiData,
  canPerformAction,
  handleCreateClick,
  handleImportCSV,
  exportToCSV,
  windowPrint,
  filters,
  handleFilterChange,
  clearFilters,
  mainContent,
  currentPage,
  pageCount,
  pageSize,
  setCurrentPage,
  setPageSize,
  handleLogout,
  setAuthMode,
  setAuthModalOpen,
  PENSION_STATUSES,
}) => {
  return (
    <div className="app-container">
      <LoadingOverlay isVisible={loading} />
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />

      <Navbar
        t={t}
        user={user}
        theme={theme}
        language={language}
        onLoginClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}
        onRegisterClick={() => { setAuthMode('register'); setAuthModalOpen(true); }}
        onLogout={handleLogout}
        onThemeToggle={() => setTheme(th => th === 'light' ? 'dark' : 'light')}
        onLangToggle={() => setLanguage(lang => lang === 'en' ? 'bn' : 'en')}
      />

      <main className="main-content">
        <section className="dashboard-section">
          <KpiCard title={t('totalPensions')} value={kpiData.total} />
          <KpiCard title={t('active')} value={kpiData.active} />
          <KpiCard title={t('retired')} value={kpiData.retired} />
          <KpiCard title={t('suspended')} value={kpiData.suspended} />
          <KpiCard title={t('deceased')} value={kpiData.deceased} />
        </section>
        <KpiCard title={t('totalFund')} value={kpiData.totalFund} />
        <br />
        <br />

        <section className="toolbar-section">
          <div className="toolbar-actions">
            <Tooltip text={!user ? t('loginRequired') : !canPerformAction ? t('adminClerkRequired') : ''} disabled={!user || !canPerformAction}>
              <button onClick={handleCreateClick} disabled={!canPerformAction}>{t('createPension')}</button>
            </Tooltip>
            <Tooltip text={!user ? t('loginRequired') : !canPerformAction ? t('adminClerkRequired') : ''} disabled={!user || !canPerformAction}>
              <label className={`button-like ${(!user || !canPerformAction) ? 'disabled' : ''}`}>
                {t('importCSV')}
                <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} disabled={!canPerformAction} />
              </label>
            </Tooltip>
            <button onClick={exportToCSV}>{t('exportCSV')}</button>
            <button onClick={windowPrint}>{t('exportPDF')}</button>
          </div>
          <div className="toolbar-filters">
            <input type="search" name="query" placeholder={t('searchPlaceholder')} value={filters.query} onChange={handleFilterChange} />
            <div className="filter-group">
              <label>{t('filterByStatus')}:</label>
              <div className="checkbox-group">
                {PENSION_STATUSES.map(s => (
                  <label key={s}>
                    <input type="checkbox" name="status" value={s} checked={filters.status.includes(s)} onChange={handleFilterChange} />
                    {t(s.toLowerCase())}
                  </label>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <label>{t('filterByAmount')}:</label>
              <input type="number" name="amountMin" placeholder={t('min')} value={filters.amountMin} onChange={handleFilterChange} />
              <input type="number" name="amountMax" placeholder={t('max')} value={filters.amountMax} onChange={handleFilterChange} />
            </div>
            <div className="filter-group">
              <label>{t('filterByDate')}:</label>
              <input type="date" name="dateStart" value={filters.dateStart} onChange={handleFilterChange} />
              <input type="date" name="dateEnd" value={filters.dateEnd} onChange={handleFilterChange} />
            </div>
            <button onClick={clearFilters} className="clear-filters-btn">{t('clearFilters')}</button>
          </div>
        </section>

        {mainContent()}

        <Pagination
          t={t}
          currentPage={currentPage}
          pageCount={pageCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(s) => setPageSize(Number(s))}
        />
      </main>

      <footer className="app-footer">
        © {new Date().getFullYear()} {t('appTitle')}
      </footer>
    </div>
  );
};

export default Dashboard;
