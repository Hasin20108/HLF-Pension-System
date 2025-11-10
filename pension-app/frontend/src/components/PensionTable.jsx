import React from "react";

export default function PensionTable({
  t,
  items,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onCreate,
  onEdit,
  onDelete,
  onContribWithdraw,
}) {
  return (
    <section className="table-section">
      <div className="table-actions">
        <input
          placeholder={t("search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">{t("allStatuses")}</option>
          <option value="Active">{t("active")}</option>
          <option value="Suspended">{t("suspended")}</option>
        </select>
        <button onClick={onCreate}>{t("createPension")}</button>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>{t("id")}</th>
            <th>{t("name")}</th>
            <th>{t("amount")}</th>
            <th>{t("status")}</th>
            <th>{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.recipientName}</td>
              <td>{p.amount}</td>
              <td>{p.status}</td>
              <td>
                <button onClick={() => onEdit(p)}>{t("edit")}</button>
                <button onClick={() => onDelete(p)}>{t("delete")}</button>
                <button onClick={() => onContribWithdraw("contribute", p)}>{t("contribute")}</button>
                <button onClick={() => onContribWithdraw("withdraw", p)}>{t("withdraw")}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}



