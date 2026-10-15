import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { 
  History, 
  RotateCcw, 
  Filter, 
  Search, 
  Eye, 
  Check, 
  Plus, 
  Trash2, 
  ArrowRight,
  GitCommit,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AuditEntry, ConfigEnvironment } from '../../types/config';
import { formatJson, computeJsonDiff, DiffLine } from '../../utils/jsonUtils';

export const AuditHistoryView: React.FC = () => {
  const {
    auditLogs,
    rollbackToAuditVersion,
    activeEnvironment,
    addToast
  } = useConfig();

  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(auditLogs[0]?.id || null);
  const [filterEnv, setFilterEnv] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchKey, setSearchKey] = useState<string>('');

  const filteredLogs = auditLogs.filter(entry => {
    if (filterEnv !== 'all' && entry.environment !== filterEnv) return false;
    if (filterAction !== 'all' && entry.action !== filterAction) return false;
    if (searchKey.trim()) {
      const q = searchKey.toLowerCase();
      return entry.key.toLowerCase().includes(q) || entry.userName.toLowerCase().includes(q);
    }
    return true;
  });

  const selectedEntry = auditLogs.find(a => a.id === selectedAuditId);

  // Calculate diff lines
  const diffLines: DiffLine[] = selectedEntry
    ? computeJsonDiff(selectedEntry.previousValue, selectedEntry.newValue)
    : [];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50/40 dark:bg-neutral-950 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Change History & JSON Diff
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Complete cryptographic audit trail of all configuration changes, promotions, and rollbacks with visual diff inspection.
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs w-64 shadow-xs">
          <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <input
            type="text"
            placeholder="Search key or user..."
            value={searchKey}
            onChange={e => setSearchKey(e.target.value)}
            className="w-full bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
          />
        </div>

        <select
          value={filterEnv}
          onChange={e => setFilterEnv(e.target.value)}
          className="px-2.5 py-1.5 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs focus:outline-none"
        >
          <option value="all">All Environments</option>
          <option value="development">Development</option>
          <option value="staging">Staging</option>
          <option value="production">Production</option>
        </select>

        <select
          value={filterAction}
          onChange={e => setFilterAction(e.target.value)}
          className="px-2.5 py-1.5 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs focus:outline-none"
        >
          <option value="all">All Actions</option>
          <option value="update">Updates</option>
          <option value="create">Creations</option>
          <option value="delete">Deletions</option>
          <option value="promote">Promotions</option>
          <option value="rollback">Rollbacks</option>
        </select>
      </div>

      {/* Split layout: Audit log list on left, JSON Diff viewer on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Entries list */}
        <div className="lg:col-span-5 space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-400">
              No audit logs match current filters.
            </div>
          ) : (
            filteredLogs.map(entry => {
              const isSelected = selectedAuditId === entry.id;

              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedAuditId(entry.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-neutral-900 dark:border-neutral-100 bg-white dark:bg-neutral-900 shadow-xs ring-1 ring-neutral-900/10'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      {entry.key}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 uppercase text-neutral-500">
                      v{entry.version}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-600 dark:text-neutral-300 line-clamp-1 mb-2">
                    {entry.summary || `${entry.action.toUpperCase()} action`}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="capitalize font-semibold text-neutral-700 dark:text-neutral-300">{entry.environment}</span>
                      <span>·</span>
                      <span>{entry.userName}</span>
                    </div>
                    <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Detailed Diff Viewer */}
        <div className="lg:col-span-7">
          {selectedEntry ? (
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
              {/* Header of selected change */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {selectedEntry.key}
                    </span>
                    <span className="capitalize font-semibold text-neutral-500">
                      ({selectedEntry.environment})
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Authored by {selectedEntry.userName} on {new Date(selectedEntry.timestamp).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => rollbackToAuditVersion(selectedEntry.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                  title="Revert configuration key to this previous value"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore this version</span>
                </button>
              </div>

              {/* JSON Diff Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                    Visual Diff (Previous vs Applied)
                  </span>
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-rose-600">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Removed
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Added
                    </span>
                  </div>
                </div>

                <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-neutral-950 font-mono text-xs max-h-96 overflow-y-auto">
                  {diffLines.map((line, idx) => {
                    const isAdded = line.type === 'added';
                    const isRemoved = line.type === 'removed';

                    return (
                      <div
                        key={idx}
                        className={`flex py-0.5 px-3 font-mono text-[11px] leading-relaxed ${
                          isAdded
                            ? 'bg-emerald-950/40 text-emerald-300'
                            : isRemoved
                            ? 'bg-rose-950/40 text-rose-300 line-through opacity-80'
                            : 'text-neutral-400'
                        }`}
                      >
                        <span className="w-6 text-neutral-600 select-none text-right mr-3">
                          {isAdded ? '+' : isRemoved ? '-' : ' '}
                        </span>
                        <span className="flex-1 whitespace-pre">{line.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 text-neutral-400">
              Select an audit entry from the left to view visual diff and rollback options.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
