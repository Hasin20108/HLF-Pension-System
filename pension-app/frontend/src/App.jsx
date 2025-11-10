import { useState, useEffect, useMemo, useCallback } from 'react';
import { API_BASE, PENSION_STATUSES, ROLES, DEBOUNCE_DELAY} from "./utils/constants";
import { translations } from "./utils/translations";
import { emptyForm, formatCurrency, formatDate } from "./utils/helpers";
import { Navbar } from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import { AuditModal } from './components/AuditModal.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {useLocalStorage, useDebounce} from "./hooks/useLocalStorage"
import { AuthForm } from './components/Forms/AuthForm.jsx';
import { FormCreateEdit } from './components/Forms/FormCreateEdit.jsx';
import { ContribWithdrawForm } from './components/Forms/ContribWithdrawForm.jsx';
import { Pagination } from './components/Pagination.jsx';
import { HistoryTimeline } from './components/HistoryTimeline.jsx';
import { Tooltip, KpiCard, StatusPill, Modal, Drawer, ToastContainer, LoadingOverlay, EmptyState, ErrorState } from "./components/ReusableComponents.jsx";
import "./styles/App.css";

// ===== SECTION: Main App Component =====

export default function App() {
  // ===== State Management =====
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [toasts, setToasts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [isHistoryDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [activePension, setActivePension] = useState(null);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isContribWithdrawModalOpen, setContribWithdrawModalOpen] = useState(false);
  const [contribWithdrawMode, setContribWithdrawMode] = useState('contribute'); // 'contribute' or 'withdraw'
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  //Audit
  // App.jsx (or wherever your table/list is)

  const [isAuditConfirmOpen, setAuditConfirmOpen] = useState(false);
  const [auditData, setAuditData] = useState(null);
  const [auditError, setAuditError] = useState(null);
  const [loading1, setLoading1] = useState(false);
  
  // Custom Hooks for Persisted State
  const [language, setLanguage] = useLocalStorage('pension-lang', 'bn');
  const [theme, setTheme] = useLocalStorage('pension-theme', 'light');
  const [user, setUser] = useLocalStorage('pension-user', null);

  // Filtering & Sorting State
  const [filters, setFilters] = useState({ query: '', status: [], amountMin: '', amountMax: '', dateStart: '', dateEnd: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useLocalStorage('pension-pagesize', 10);
  
  const debouncedQuery = useDebounce(filters.query, DEBOUNCE_DELAY);
  
  // Translation helper
  const t = useCallback((key) => translations[language][key] || key, [language]);
  
  // ===== Effects =====
  useEffect(() => {
    document.body.className = theme;
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  useEffect(() => {
    fetchPensions();
  }, []);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, filters.status, filters.amountMin, filters.amountMax, filters.dateStart, filters.dateEnd, pageSize]);

  //BUTTON
   const [isVisible, setIsVisible] = useState(false); // state to control visibility


  const handleToggleContent = () => {
    setIsVisible((prev) => !prev); // Toggle visibility
  };
  // ===== Memos & Derived Data =====
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];

    // Filter by text query
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      filtered = filtered.filter(
        (x) =>
          x.id.toLowerCase().includes(q) ||
          x.recipientName.toLowerCase().includes(q) ||
          x.status.toLowerCase().includes(q)
      );
    }

    // Filter by status
    if (filters.status.length > 0) {
      filtered = filtered.filter((x) => filters.status.includes(x.status));
    }

    // Filter by amount
    if (filters.amountMin) {
      filtered = filtered.filter((x) => x.amount >= Number(filters.amountMin));
    }
    if (filters.amountMax) {
      filtered = filtered.filter((x) => x.amount <= Number(filters.amountMax));
    }

    // Filter by date
    if (filters.dateStart) {
      filtered = filtered.filter((x) => new Date(x.lastUpdated) >= new Date(filters.dateStart));
    }
    if (filters.dateEnd) {
      filtered = filtered.filter((x) => new Date(x.lastUpdated) <= new Date(filters.dateEnd));
    }

    // Sort
    filtered.sort((a, b) => {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
      return String(aVal).localeCompare(String(bVal)) * dir;
    });

    return filtered;
  }, [items, debouncedQuery, filters, sortConfig]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedItems.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedItems, currentPage, pageSize]);

  const pageCount = useMemo(() => Math.ceil(filteredAndSortedItems.length / pageSize), [filteredAndSortedItems.length, pageSize]);

  const kpiData = useMemo(() => {
      const totalFund = items.reduce((sum, item) => sum + item.amount, 0);
      const statusCounts = items.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
      }, {});
      return {
          total: items.length,
          active: statusCounts.Active || 0,
          retired: statusCounts.Retired || 0,
          suspended: statusCounts.Suspended || 0,
          deceased: statusCounts.Deceased || 0,
          totalFund: formatCurrency(totalFund)
      };
  }, [items]);


  // ===== Toast Notifications =====
  const addToast = (message, type = 'success') => {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // ===== API Functions =====
  const fetchPensions = useCallback(async () => {
    setLoading(true);
    setGlobalError("");
    try {
      const res = await fetch(`${API_BASE}/pensions`);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      const normalized = (Array.isArray(data) ? data : []).map((d) => ({
        id: d.id ?? d.ID ?? "",
        recipientName: d.recipientName ?? d.RecipientName ?? "",
        amount: Number(d.amount ?? d.Amount ?? 0),
        status: d.status ?? d.Status ?? "Active",
        lastUpdated: d.lastUpdated ?? d.LastUpdated ?? "",
      }));
      setItems(normalized);
    } catch (e) {
      console.error(e);
      const errorMsg = e.message.includes("Failed to fetch")
        ? "Cannot connect to the backend server. Please ensure it's running."
        : e.message;
      setGlobalError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);
  
  const fetchHistory = useCallback(async (id) => {
      setLoading(true);
      setActivePension(items.find(item => item.id === id));
      try {
          const res = await fetch(`${API_BASE}/pensions/${encodeURIComponent(id)}/history`);
          if (!res.ok) throw new Error(await res.text());
          const data = await res.json();
          const processedHistory = (Array.isArray(data) ? data : []).map(h => ({
            ...h,
            // The server.js already provides `txId`
            txId: h.txId || 'N/A',
            isDelete: h.isDelete || (h.value === null), // Handle both explicit and implicit deletion markers
            // server.js provides timestamp string which can be parsed.
            timestamp: h.timestamp
          }));
          setHistoryData(processedHistory);
          setHistoryDrawerOpen(true);
      } catch (e) {
          console.error(e);
          addToast(`Failed to fetch history: ${e.message}`, 'error');
      } finally {
          setLoading(false);
      }
  }, [items, addToast]);

  const handleSubmit = async (formData) => {
      const payload = {
        id: formData.id?.trim() || `PENSION_${Date.now()}`,
        recipientName: formData.recipientName?.trim(),
        amount: Number(formData.amount),
        status: formData.status,
      };

      if (!payload.recipientName || !payload.status || isNaN(payload.amount)) {
          addToast("Please fill all required fields correctly.", 'error');
          return;
      }
      
      setLoading(true);
      try {
          const url = isEditing ? `${API_BASE}/pensions/${encodeURIComponent(payload.id)}` : `${API_BASE}/pensions`;
          const method = isEditing ? 'PUT' : 'POST';
          const body = isEditing ? { recipientName: payload.recipientName, amount: payload.amount, status: payload.status } : payload;
          
          const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
          });

          if (!res.ok) {
              const errorText = await res.text();
              throw new Error(errorText || `${method} operation failed`);
          }

          addToast(`Pension ${isEditing ? 'updated' : 'created'} successfully!`);
          setFormModalOpen(false);
          await fetchPensions();
      } catch (e) {
          console.error(e);
          addToast(e.message, 'error');
      } finally {
          setLoading(false);
      }
  };

  const handleDelete = async (id) => {
      setLoading(true);
      try {
          const res = await fetch(`${API_BASE}/pensions/${encodeURIComponent(id)}`, { method: 'DELETE' });
          if (!res.ok) throw new Error(await res.text());
          addToast(`Pension ${id} deleted successfully.`);
          await fetchPensions();
      } catch (e) {
          console.error(e);
          addToast(`Failed to delete: ${e.message}`, 'error');
      } finally {
          setLoading(false);
          setDeleteConfirmOpen(false);
          setActivePension(null);
      }
  };


// ===== Event Handlers =====
  const handleSort = (key) => {
      setSortConfig(prev => ({
          key,
          direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
      }));
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'status') {
      setFilters(prev => ({
        ...prev,
        status: checked ? [...prev.status, value] : prev.status.filter(s => s !== value)
      }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const clearFilters = () => {
      setFilters({ query: '', status: [], amountMin: '', amountMax: '', dateStart: '', dateEnd: '' });
  };
  
  const handleCreateClick = () => {
      setForm(emptyForm);
      setIsEditing(false);
      setFormModalOpen(true);
  };
  
  const handleEditClick = (row) => {
      setForm(row);
      setIsEditing(true);
      setFormModalOpen(true);
  };

  const handleDeleteClick = (row) => {
      setActivePension(row);
      setDeleteConfirmOpen(true);
  };
  
  const handleContribWithdrawClick = (row, mode) => {
      setActivePension(row);
      setContribWithdrawMode(mode);
      setContribWithdrawModalOpen(true);
  };
  const handleAuditClick = (row, mode) => {
      setActivePension(row);
      setAuditData(mode);
      setAuditConfirmOpen(true);
  };

  const handleContribWithdrawSubmit = async (amount) => {
    if (!activePension || isNaN(amount) || amount <= 0) {
      addToast("Invalid amount provided.", 'error');
      return;
    }

    const currentAmount = activePension.amount;
    let newAmount;
    if (contribWithdrawMode === 'withdraw') {
      if (amount > currentAmount) {
        addToast(t('insufficientFunds'), 'error');
        return;
      }
      newAmount = currentAmount - amount;
    } else {
      newAmount = currentAmount + amount;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/pensions/${encodeURIComponent(activePension.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...activePension, amount: newAmount }),
      });
      if (!res.ok) throw new Error(await res.text());

      addToast(t('operationSuccessful'));
      await fetchPensions();
      setContribWithdrawModalOpen(false);
      setActivePension(null);
    } catch (e) {
      console.error(e);
      addToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = ({ username, role }) => {
    setUser({ username, role });
    addToast(`Welcome, ${username}!`, 'success');
    setAuthModalOpen(false);
  };
  
  const handleLogout = () => {
    setUser(null);
    addToast('You have been logged out.', 'success');
  };

  const exportToCSV = () => {
    const headers = ['id', 'recipientName', 'amount', 'status', 'lastUpdated'];
    const rows = filteredAndSortedItems.map(row => 
        headers.map(header => {
            let val = row[header];
            if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
            return val;
        }).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pensions_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split('\n').slice(1); // Skip header
        setLoading(true);
        let successCount = 0;
        let errorCount = 0;

        for (const row of rows) {
            if (!row.trim()) continue;
            const [id, recipientName, amount, status] = row.split(',');
            try {
                const payload = { id, recipientName, amount: parseFloat(amount), status };
                const res = await fetch(`${API_BASE}/pensions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error();
                successCount++;
            } catch {
                errorCount++;
            }
        }
        setLoading(false);
        addToast(`${successCount} records imported successfully. ${errorCount} failed.`, errorCount > 0 ? 'error' : 'success');
        fetchPensions();
    };
    reader.readAsText(file);
    event.target.value = null; // Reset file input
  };



// Function to trigger the audit (your existing handleAudit logic)
const handleAudit = async (id) => {
  setLoading1(true);
  setAuditError(null);
  console.log(id);
  

  try {
    const res = await fetch(`${API_BASE}/pensions/${encodeURIComponent(id)}/audit`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    setAuditData({ id, ...data });
    setAuditConfirmOpen(true); // Open the modal
  } catch (e) {
    console.error(e);
    setAuditError(e.message || 'Audit failed');
  } finally {
    setLoading1(false);
  }
};





  const canPerformAction = user && (user.role === ROLES.ADMIN || user.role === ROLES.CLERK);

  
  
  // ===== Render Logic =====
  const mainContent = () => {
    if (globalError) return <ErrorState message={globalError} onRetry={fetchPensions} />;
    if (loading && items.length === 0) return <div style={{textAlign: 'center', padding: '4rem'}}>{t('loading')}</div>;
    if (items.length === 0) return <EmptyState message={t('noRecords')} onAction={handleCreateClick} actionLabel={t('createPension')} />;
    
    return (
      <div className="data-table-container">
        <table className="data-table" aria-busy={loading}>
          <thead className="sticky-header">
            <tr>
              {['id', 'recipientName', 'amount', 'status', 'lastUpdated'].map(key => (
                <th key={key} onClick={() => handleSort(key)} aria-sort={sortConfig.key === key ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  {t(key === 'id' ? 'pensionId' : key)}
                  {sortConfig.key === key && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                </th>
              ))}
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr><td colSpan="6"><EmptyState message={t('noRecords')} /></td></tr>
            ) : (
              paginatedItems.map(row => (
                <tr key={row.id}>
                  <td data-label={t('pensionId')} className="font-mono">{row.id}</td>
                  <td data-label={t('recipientName')} className={row.status === 'Deceased' ? 'strikethrough' : ''}>{row.recipientName}</td>
                  <td data-label={t('amount')}>{formatCurrency(row.amount)}</td>
                  <td data-label={t('status')}><StatusPill status={row.status} /></td>
                  <td data-label={t('lastUpdated')}>{formatDate(row.lastUpdated)}</td>
                  <td data-label={t('actions')} className="actions-cell">
                    <Tooltip text={!user ? t('loginRequired') : !canPerformAction ? t('adminClerkRequired') : ''} disabled={!user || !canPerformAction}>
                        <button className="action-button" onClick={() => handleEditClick(row)} disabled={!canPerformAction || row.status === 'Deceased'}>
                            {t('edit')}
                        </button>
                    </Tooltip>
                    <Tooltip text={!user ? t('loginRequired') : !canPerformAction ? t('adminClerkRequired') : ''} disabled={!user || !canPerformAction}>
                        <button className="action-button" onClick={() => handleContribWithdrawClick(row, 'contribute')} disabled={!canPerformAction || row.status === 'Deceased'}>
                            {t('contribute')}
                        </button>
                    </Tooltip>
                     <Tooltip text={!user ? t('loginRequired') : !canPerformAction ? t('adminClerkRequired') : ''} disabled={!user || !canPerformAction}>
                        <button className="action-button" onClick={() => handleContribWithdrawClick(row, 'withdraw')} disabled={!canPerformAction || row.status === 'Deceased'}>
                            {t('withdraw')}
                        </button>
                    </Tooltip>
                    <button className="action-button" onClick={() => fetchHistory(row.id)}>{t('history')}</button>
                    <Tooltip text={!user ? t('loginRequired') : user?.role !== ROLES.ADMIN ? "Admin role required" : ''} disabled={!user || user.role !== ROLES.ADMIN}>
                        <button className="action-button" onClick={() => handleDeleteClick(row)} disabled={!user || user.role !== ROLES.ADMIN}>
                            {t('delete')}
                        </button>
                    </Tooltip>
                    <Tooltip
                        text={!user ? t('loginRequired') : user?.role !== ROLES.ADMIN ? "Admin role required" : ''}
                        disabled={!user || user.role !== ROLES.ADMIN}
                      >
                        <button
                          className="action-button"
                          onClick={() => { handleAudit(row.id); handleAuditClick(row)}}  // ✅ always send the actual ID
                          disabled={!user || user.role !== ROLES.ADMIN}
                        >
                          {t('Audit')}
                        </button>
                      </Tooltip>

                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <>
      <div className="app-container">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
            <button onClick={handleToggleContent}>
        {isVisible ? 'Hide Dashboard' : 'Show Dashboard'}
      </button>

      {/* Conditionally render the content */}
      {isVisible && (
        <>
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
                <button onClick={() => window.print()}>{t('exportPDF')}</button>
                
              </div>
              <div className="toolbar-filters">
                <input type="search" name="query" placeholder={t('searchPlaceholder')} value={filters.query} onChange={handleFilterChange} />
                <div className="filter-group">
                  <label>{t('filterByStatus')}:</label>
                  <div className="checkbox-group">
                    {PENSION_STATUSES.map(s => (
                      <label key={s}><input type="checkbox" name="status" value={s} checked={filters.status.includes(s)} onChange={handleFilterChange} /> {t(s.toLowerCase())}</label>
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
        </>
      )}
    </div>
      

      {/* Modals & Drawers */}
      <FormCreateEdit t={t} isVisible={isFormModalOpen} isEditing={isEditing} initialData={form} onClose={() => setFormModalOpen(false)} onSubmit={handleSubmit} />
      
      <Drawer isVisible={isHistoryDrawerOpen} onClose={() => setHistoryDrawerOpen(false)} title={`${t('pensionHistoryFor')} ${activePension?.id || ''}`}>
        <HistoryTimeline t={t} history={historyData} />
      </Drawer>
      
      <Modal isVisible={isDeleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title={t('confirmDeleteTitle')}>
        <p>{t('confirmDeleteBody')} (ID: {activePension?.id})</p>
        <div className="modal-actions">
          <button className="danger" onClick={() => handleDelete(activePension?.id)}>{t('delete')}</button>
          <button onClick={() => setDeleteConfirmOpen(false)}>{t('cancel')}</button>
        </div>
      </Modal>


        <AuditModal
          open={isAuditConfirmOpen}
          onClose={() => setAuditConfirmOpen(false)}
          data={auditData}
          error={auditError}
          loading={loading1}
        />
      <Modal 
        isVisible={isContribWithdrawModalOpen}
        onClose={() => setContribWithdrawModalOpen(false)}
        title={contribWithdrawMode === 'contribute' ? t('contributeToPension') : t('withdrawFromPension')}
      >
        <ContribWithdrawForm t={t} pension={activePension} mode={contribWithdrawMode} onSubmit={handleContribWithdrawSubmit} onCancel={() => setContribWithdrawModalOpen(false)} />
      </Modal>

      <Modal
        isVisible={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authMode === 'login' ? t('login') : t('register')}
      >
        <AuthForm t={t} mode={authMode} onSubmit={handleAuthSubmit} />
      </Modal>
    </>
  );
}


