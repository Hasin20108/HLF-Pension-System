// components.js
import React, { useEffect } from 'react';
import { CloseIcon } from '../utils/icon';
// Tooltip component
export const Tooltip = ({ text, children, disabled }) => {
  if (!disabled) return children;
  return (
    <div className="tooltip-container">
      {children}
      <span className="tooltip-text">{text}</span>
    </div>
  );
};

// KpiCard component
export const KpiCard = ({ title, value, icon }) => (
  <div className="kpi-card">
    <div className="kpi-icon">{icon}</div>
    <div className="kpi-content">
      <div className="kpi-value">{value}</div>
      <div className="kpi-title">{title}</div>
    </div>
  </div>
);

// StatusPill component
export const StatusPill = ({ status }) => {
  const statusClass = (status || '').toLowerCase();
  return <span className={`status-pill status-${statusClass}`}>{status}</span>;
};

// Modal component
export const Modal = ({ isVisible, onClose, title, children }) => {
  if (!isVisible) return null;
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="icon-button" aria-label="Close"><CloseIcon /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

// Drawer component
export const Drawer = ({ isVisible, onClose, title, children }) => {
  if (!isVisible) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className={`drawer-content ${isVisible ? 'visible' : ''}`} role="dialog" aria-modal="true">
        <div className="drawer-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="icon-button" aria-label="Close"><CloseIcon /></button>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </>
  );
};

// Toast component
export const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`toast toast-${type}`} role="alert" aria-live="assertive">
      <div className="toast-content">
        <strong>{type === 'success' ? 'Success!' : 'Error!'}</strong>
        <span>{message}</span>
      </div>
      <button onClick={onDismiss} className="toast-close" aria-label="Dismiss"><CloseIcon /></button>
    </div>
  );
};

// ToastContainer component
export const ToastContainer = ({ toasts, dismissToast }) => (
  <div className="toast-container">
    {toasts.map((toast) => (
      <Toast key={toast.id} {...toast} onDismiss={() => dismissToast(toast.id)} />
    ))}
  </div>
);

// LoadingOverlay component
export const LoadingOverlay = ({ isVisible }) => {
  if (!isVisible) return null;
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
    </div>
  );
};

// EmptyState component
export const EmptyState = ({ message, onAction, actionLabel }) => (
  <div className="empty-state">
    <p>{message}</p>
    {onAction && <button onClick={onAction}>{actionLabel}</button>}
  </div>
);

// ErrorState component
export const ErrorState = ({ message, onRetry }) => (
  <div className="error-state">
    <p>😞 {message}</p>
    {onRetry && <button onClick={onRetry}>Retry</button>}
  </div>
);


  // ===== Toast Notifications =====
  export const addToast = (message, type = 'success') => {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
  };

  export const dismissToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };