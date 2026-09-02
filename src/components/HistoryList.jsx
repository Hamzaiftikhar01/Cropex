import { useState } from 'react';

function HistoryList({ history, onSelectHistory, onClearHistory }) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (!history || history.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-earth-200 bg-white p-6 sm:p-8 text-center dark:border-earth-800 dark:bg-earth-900">
        <span className="text-2xl" role="img" aria-label="Inbox">🗂️</span>
        <h4 className="mt-2 text-xs sm:text-sm font-bold text-earth-800 dark:text-earth-200">No Diagnosis History Found</h4>
        <p className="mt-1 text-xs text-earth-500 dark:text-earth-400 max-w-xs mx-auto">
          Scanned leaves and diagnostic reports will automatically appear here.
        </p>
      </div>
    );
  }

  const getConfidenceBadge = (confidence) => {
    let val = 80;
    if (typeof confidence === 'number') {
      val = confidence;
    } else if (typeof confidence === 'string') {
      const parsed = parseInt(confidence.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsed)) val = parsed;
    }

    if (val >= 95) {
      return <span className="text-green-600 dark:text-green-400 font-bold text-xs">🟢 {val}%</span>;
    } else if (val >= 75) {
      return <span className="text-amber-600 dark:text-amber-400 font-bold text-xs">🟡 {val}%</span>;
    } else {
      return <span className="text-red-500 dark:text-red-400 font-bold text-xs">🔴 {val}%</span>;
    }
  };

  const getSeverityBadge = (severity) => {
    const sev = (severity || 'Low').trim().toLowerCase();
    if (sev === 'high') {
      return <span className="text-red-500 dark:text-red-400 font-bold text-xs">🔴 High</span>;
    } else if (sev === 'moderate' || sev === 'medium') {
      return <span className="text-amber-600 dark:text-amber-400 font-bold text-xs">🟡 Mod</span>;
    } else {
      return <span className="text-green-600 dark:text-green-400 font-bold text-xs">🟢 Low</span>;
    }
  };

  return (
    <div className="rounded-2xl border border-earth-100 bg-white p-5 sm:p-6 shadow-soft dark:border-earth-800 dark:bg-earth-900 text-left">
      <div className="flex items-center justify-between pb-3 border-b border-earth-100 dark:border-earth-800">
        <div>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-earth-900 dark:text-earth-50 flex items-center gap-1.5">
            <span>📊</span> Recent Analyses
          </h3>
          <p className="text-[10px] text-earth-450 dark:text-earth-400 mt-0.5">Stored locally on device</p>
        </div>
        {showConfirm ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-red-500 mr-1 select-none">Clear?</span>
            <button
              type="button"
              onClick={() => {
                onClearHistory();
                setShowConfirm(false);
              }}
              className="text-[10px] font-bold text-white bg-red-600 px-2.5 py-1 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="text-[10px] font-bold text-earth-700 bg-earth-100 dark:bg-earth-800 dark:text-earth-300 px-2.5 py-1 rounded-lg hover:bg-earth-200 dark:hover:bg-earth-750 transition-colors cursor-pointer"
            >
              No
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors px-2 py-1 rounded cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-3 divide-y divide-earth-100 dark:divide-earth-800 max-h-96 overflow-y-auto pr-1">
        {history.map((item, idx) => (
          <div
            key={idx}
            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group hover:bg-earth-50/50 dark:hover:bg-earth-950/30 px-2 rounded-xl transition-all"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs sm:text-sm text-earth-850 dark:text-earth-200 truncate">
                  {item.crop}
                </span>
                <span className="text-xs text-earth-400 dark:text-earth-350">•</span>
                <span className="text-xs font-semibold text-earth-600 dark:text-earth-300 truncate">
                  {item.disease}
                </span>
              </div>
              <p className="text-[10px] text-earth-400 dark:text-earth-350 mt-0.5">
                {item.date || 'Recent Scan'}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right flex flex-col gap-0.5">
                {getConfidenceBadge(item.confidence)}
                {getSeverityBadge(item.severity)}
              </div>
              <button
                type="button"
                onClick={() => onSelectHistory(item)}
                className="h-8 px-2.5 inline-flex items-center justify-center rounded-lg text-xs font-bold text-crop-700 bg-crop-50 dark:bg-crop-950/30 dark:text-crop-300 hover:bg-crop-100 transition-colors cursor-pointer border border-crop-200/40"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HistoryList;
