
// ===== SECTION: Helper Functions =====
import { BDT_CURRENCY_FORMATTER } from "./constants";

export const formatCurrency = (n) => BDT_CURRENCY_FORMATTER.format(n || 0);

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleString('en-BD', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return dateString;
  }
};

export const emptyForm = { id: "", recipientName: "", amount: "", status: "Active" };