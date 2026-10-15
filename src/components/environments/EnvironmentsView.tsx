import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { 
  Layers, 
  ArrowRight, 
  Check, 
  AlertTriangle, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight,
  Filter,
  Eye
} from 'lucide-react';
import { ConfigEnvironment, ConfigItem } from '../../types/config';
import { formatJson } from '../../utils/jsonUtils';

export const EnvironmentsView: React.FC = () => {
  const {
    configs,
    activeEnvironment,
    setActiveEnvironment,
    promoteEnvironment,
    addToast
  } = useConfig();

  const [compareSource, setCompareSource] = useState<ConfigEnvironment>('development');
  const [compareTarget, setCompareTarget] = useState<ConfigEnvironment>('staging');
  const [filterMode, setFilterMode] = useState<'all' | 'differences'>('all');
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [prodConfirmText, setProdConfirmText] = useState('');

  // Calculate comparison items
  const comparisonList = configs.map(c => {
    const srcVal = c.values[compareSource];
    const tgtVal = c.values[compareTarget];
    const isDifferent = JSON.stringify(srcVal) !== JSON.stringify(tgtVal);

    return {
      config: c,
      sourceValue: srcVal,
      targetValue: tgtVal,
      isDifferent,
    };
  });

  const differingCount = comparisonList.filter(item => item.isDifferent).length;
  const filteredList = filterMode === 'differences' 
    ? comparisonList.filter(item => item.isDifferent) 
    : comparisonList;

  const handlePromoteConfirm = () => {
    if (compareTarget === 'production' && prodConfirmText.trim().toUpperCase() !== 'PROMOTE') {
      return;
    }

    promoteEnvironment(compareSource, compareTarget);
    setIsPromoteDialogOpen(false);
    setProdConfirmText('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50/40 dark:bg-neutral-950 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Environments & Change Promotion
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Compare configurations side-by-side between Development, Staging, and Production tiers, and safely promote changes.
          </p>
        </div>

        <button
          onClick={() => setIsPromoteDialogOpen(true)}
          disabled={differingCount === 0}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-md transition-colors shadow-xs disabled:opacity-40"
        >
          <span>Promote {compareSource} → {compareTarget}</span>
          <span className="px-1 text-[10px] bg-neutral-700 dark:bg-neutral-300 rounded font-mono">
            {differingCount} diffs
          </span>
        </button>
      </div>

      {/* Selector Ribbon */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Source Environment
            </label>
            <select
              value={compareSource}
              onChange={e => setCompareSource(e.target.value as ConfigEnvironment)}
              className="px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-semibold capitalize text-xs"
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>

          <div className="pt-5 text-neutral-400">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Target Environment
            </label>
            <select
              value={compareTarget}
              onChange={e => setCompareTarget(e.target.value as ConfigEnvironment)}
              className="px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-semibold capitalize text-xs"
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-md font-medium text-xs transition-colors ${
              filterMode === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            All Keys ({comparisonList.length})
          </button>
          <button
            onClick={() => setFilterMode('differences')}
            className={`px-3 py-1.5 rounded-md font-medium text-xs transition-colors ${
              filterMode === 'differences'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Differences Only ({differingCount})
          </button>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50/70 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold font-sans">
            <tr>
              <th className="p-3 w-48">Configuration Key</th>
              <th className="p-3">Source: {compareSource.toUpperCase()}</th>
              <th className="p-3">Target: {compareTarget.toUpperCase()}</th>
              <th className="p-3 w-28 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/80 dark:divide-neutral-800/80 font-mono">
            {filteredList.map(item => {
              const srcStr = typeof item.sourceValue === 'object' ? JSON.stringify(item.sourceValue) : String(item.sourceValue);
              const tgtStr = typeof item.targetValue === 'object' ? JSON.stringify(item.targetValue) : String(item.targetValue);

              return (
                <tr 
                  key={item.config.id}
                  className={`hover:bg-neutral-50 dark:hover:bg-neutral-850/60 ${
                    item.isDifferent ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                  }`}
                >
                  <td className="p-3 font-semibold text-neutral-900 dark:text-neutral-100">
                    <div>{item.config.key}</div>
                    <span className="font-sans text-[10px] text-neutral-400 uppercase">
                      {item.config.type}
                    </span>
                  </td>

                  <td className="p-3 text-neutral-800 dark:text-neutral-200 truncate max-w-xs">
                    {srcStr}
                  </td>

                  <td className="p-3 text-neutral-800 dark:text-neutral-200 truncate max-w-xs">
                    {tgtStr}
                  </td>

                  <td className="p-3 text-right font-sans">
                    {item.isDifferent ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800">
                        DIFFERENT
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-[11px]">
                        Identical
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Promotion Review Dialog */}
      {isPromoteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-lg rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                Confirm Promotion: {compareSource.toUpperCase()} → {compareTarget.toUpperCase()}
              </h3>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              This will overwrite values in <strong className="capitalize font-mono">{compareTarget}</strong> for {differingCount} configuration keys with the corresponding values currently active in <strong className="capitalize font-mono">{compareSource}</strong>.
            </p>

            {compareTarget === 'production' && (
              <div className="p-3 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 space-y-2 text-xs">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Targeting Production
                </p>
                <p className="text-[11px] leading-relaxed">
                  Type <strong className="font-mono">PROMOTE</strong> to authorize deployment to the live production runtime.
                </p>
                <input
                  type="text"
                  placeholder="Type PROMOTE"
                  value={prodConfirmText}
                  onChange={e => setProdConfirmText(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-amber-300 dark:border-amber-700 rounded text-xs font-mono"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setIsPromoteDialogOpen(false)}
                className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePromoteConfirm}
                disabled={compareTarget === 'production' && prodConfirmText.trim().toUpperCase() !== 'PROMOTE'}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded transition-colors disabled:opacity-40"
              >
                Execute Promotion ({differingCount} keys)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
