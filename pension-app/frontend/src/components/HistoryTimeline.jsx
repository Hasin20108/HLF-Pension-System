import { emptyForm, formatCurrency, formatDate } from "../utils/helpers"
import { Tooltip, KpiCard, StatusPill, Modal, Drawer, ToastContainer, LoadingOverlay, EmptyState, ErrorState } from "./ReusableComponents.jsx"

export const HistoryTimeline = ({ t, history }) => (
    <div className="history-timeline">
        {history.length === 0 ? <p>{t('noRecords')}</p> :
            history.map((item, index) => (
                <div key={index} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                        <div className="timeline-header">
                            <span className="timeline-txid" title={item.txId}>{t('txId')}: {item.txId.substring(0, 12)}...</span>
                            <span className="timeline-timestamp">{formatDate(item.timestamp)}</span>
                        </div>
                        {item.isDelete ? (
                            <p className="deleted-record">{t('isDeleted')}: {t('yes')}</p>
                        ) : (
                            <div className="timeline-details">
                                <p><strong>{t('recipientName')}:</strong> {item.value.recipientName}</p>
                                <p><strong>{t('amount')}:</strong> {formatCurrency(item.value.amount)}</p>
                                <p><strong>{t('status')}:</strong> <StatusPill status={item.value.status} /></p>
                            </div>
                        )}
                    </div>
                </div>
            ))
        }
    </div>
);
