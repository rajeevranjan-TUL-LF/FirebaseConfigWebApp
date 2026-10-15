import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { 
  AlertTriangle, 
  Check, 
  X, 
  UploadCloud, 
  RotateCcw,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { formatJson } from '../../utils/jsonUtils';

export const PublishDialog: React.FC = () => {
  const {
    isPublishDialogOpen,
    setIsPublishDialogOpen,
    activeEnvironment,
    configs,
    publishPendingChanges,
    discardDrafts,
  } = useConfig();

  const [confirmPhrase, setConfirmPhrase] = useState('');
  const isProduction = activeEnvironment === 'production';

  if (!isPublishDialogOpen) return null;

  // Find all configs with pending drafts in the active environment
  const pendingConfigs = configs.filter(c => {
    if (!c.draftValues) return false;
    const currentVal = c.values[activeEnvironment];
    const draftVal = c.draftValues[activeEnvironment];
    return draftVal !== undefined && JSON.stringify(currentVal) !== JSON.stringify(draftVal);
  });

  const isConfirmed = !isProduction || confirmPhrase.trim().toUpperCase() === 'PUBLISH';

  const handlePublish = () => {
    if (!isConfirmed) return;
    publishPendingChanges(activeEnvironment);
    setIsPublishDialogOpen(false);
    setConfirmPhrase('');
  };

  const handleDiscard = () => {
    discardDrafts(activeEnvironment);
    setIsPublishDialogOpen(false);
    setConfirmPhrase('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-md ${
              isProduction ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
            }`}>
              {isProduction ? <ShieldAlert className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Publish Changes to {activeEnvironment.toUpperCase()}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Review {pendingConfigs.length} pending draft {pendingConfigs.length === 1 ? 'change' : 'changes'} before making them live.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPublishDialogOpen(false)}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content: Diff list */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {pendingConfigs.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No pending drafts for {activeEnvironment}. Everything is up to date!
            </div>
          ) : (
            pendingConfigs.map(c => {
              const currentVal = c.values[activeEnvironment];
              const draftVal = c.draftValues![activeEnvironment];

              const currentStr = typeof currentVal === 'object' ? formatJson(currentVal, 0) : String(currentVal);
              const draftStr = typeof draftVal === 'object' ? formatJson(draftVal, 0) : String(draftVal);

              return (
                <div 
                  key={c.id}
                  className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                      {c.key}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      {c.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-neutral-200/60 dark:border-neutral-800/60 font-mono text-[11px]">
                    <div>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-sans">
                        Currently Live (v{c.version})
                      </p>
                      <div className="p-2 rounded bg-rose-50/60 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 truncate max-h-16 overflow-hidden">
                        {currentStr}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-sans">
                        Draft to Publish (v{c.version + 1})
                      </p>
                      <div className="p-2 rounded bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 truncate max-h-16 overflow-hidden">
                        {draftStr}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Production Protection Prompt */}
          {isProduction && pendingConfigs.length > 0 && (
            <div className="p-3.5 rounded-lg border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 space-y-2 text-xs">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Production Environment Safeguard
              </p>
              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                Publishing directly impacts live client applications in real time via the Runtime API. Type <strong className="font-mono">PUBLISH</strong> below to authorize deployment.
              </p>
              <input
                type="text"
                placeholder="Type PUBLISH to confirm"
                value={confirmPhrase}
                onChange={e => setConfirmPhrase(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 border border-amber-300 dark:border-amber-700 rounded text-xs font-mono text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
          <button
            onClick={handleDiscard}
            disabled={pendingConfigs.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Discard all drafts</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPublishDialogOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={pendingConfigs.length === 0 || !isConfirmed}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded transition-colors shadow-xs ${
                pendingConfigs.length === 0 || !isConfirmed
                  ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm & Publish ({pendingConfigs.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
