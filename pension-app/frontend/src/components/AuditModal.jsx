export const AuditModal = ({ open, onClose, data, error, loading }) => {
  if (!open) return null; // If modal is not open, return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[min(900px,95vw)] max-h-[85vh] overflow-auto rounded-xl bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            Audit Result — Pension <span className="font-mono">{data?.id}</span>
          </h2>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 focus:outline-none"
            aria-label="Close Audit Modal"
          >
            Close
          </button>
        </div>

        {/* Display error message if any */}
        {error && (
          <div className="mb-3 rounded border border-red-300 bg-red-50 p-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Display loading message/spinner */}
        {loading ? (
          <div className="text-center py-4">
            <span className="text-lg text-gray-600">Loading audit data...</span>
          </div>
        ) : (
          <>
            {/* Display audit data */}
            {data && (
              <>
                <div className="mb-3 rounded border bg-gray-50 p-3">
                  <div className="text-sm text-gray-600">Final Chain Hash</div>
                  <div className="font-mono break-all">{data.finalChainHash}</div>
                </div>
                <br />
                <h1 className="text-lg font-semibold">Audit Completed,</h1>
                <h1 className="text-lg font-semibold">Transaction Valid.</h1>
                <br />

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr>
                        <th className="border-b p-2">#</th>
                        <th className="border-b p-2">TxId</th>
                        <th className="border-b p-2">Timestamp (UTC)</th>
                        <th className="border-b p-2">IsDelete</th>
                        <th className="border-b p-2">ValueHash</th>
                        <th className="border-b p-2">EntryHash</th>
                        <th className="border-b p-2">ChainHash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.entries || []).map((e, i) => (
                        <tr key={e.txId + i}>
                          <td className="border-b p-2 align-top">{i + 1}</td>
                          <td className="border-b p-2 align-top font-mono break-all">{e.txId}</td>
                          <td className="border-b p-2 align-top">{new Date(e.timestamp).toISOString()}</td>
                          <td className="border-b p-2 align-top">{String(e.isDelete)}</td>
                          <td className="border-b p-2 align-top font-mono break-all">{e.valueHash || '—'}</td>
                          <td className="border-b p-2 align-top font-mono break-all">{e.entryHash}</td>
                          <td className="border-b p-2 align-top font-mono break-all">{e.chainHash}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
