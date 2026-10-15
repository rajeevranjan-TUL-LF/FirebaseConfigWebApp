import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { 
  Boxes, 
  ArrowRight, 
  AlertTriangle, 
  Check, 
  RotateCcw, 
  Search, 
  Sliders, 
  CheckCircle2, 
  Plus, 
  RefreshCw,
  FolderInput,
  ShieldAlert
} from 'lucide-react';
import { sampleExternalApiPayload } from '../../data/initialConfig';
import { resolveJsonPath, flattenObject, formatJson, inferValueType } from '../../utils/jsonUtils';

export const ResponseMappingView: React.FC = () => {
  const {
    configs,
    activeEnvironment,
    importFromApiMapping,
    addToast
  } = useConfig();

  const [jsonPath, setJsonPath] = useState('$.data.feature_flags');
  const [nestedHandling, setNestedHandling] = useState<'nested_as_json' | 'flatten'>('flatten');
  const [conflictMode, setConflictMode] = useState<'merge' | 'replace'>('merge');
  const [showDestructiveConfirm, setShowDestructiveConfirm] = useState(false);

  // Available common presets
  const presets = [
    { label: 'Feature Flags ($.data.feature_flags)', path: '$.data.feature_flags' },
    { label: 'Operational Limits ($.data.limits)', path: '$.data.limits' },
    { label: 'Branding Configuration ($.data.branding)', path: '$.data.branding' },
    { label: 'Entire Payload ($.data)', path: '$.data' },
  ];

  // Resolve target object
  const resolvedData = resolveJsonPath(sampleExternalApiPayload, jsonPath);

  // Generate mapped key-value dictionary
  const getMappedDictionary = (): Record<string, any> => {
    if (!resolvedData || typeof resolvedData !== 'object') return {};

    if (nestedHandling === 'flatten') {
      return flattenObject(resolvedData);
    }
    return resolvedData;
  };

  const mappedDict = getMappedDictionary();
  const mappedKeys = Object.keys(mappedDict);

  // Compare with current active configs
  const existingKeyMap = new Map(configs.map(c => [c.key, c]));

  const diffSummary = {
    additions: mappedKeys.filter(k => !existingKeyMap.has(k)),
    updates: mappedKeys.filter(k => existingKeyMap.has(k)),
    removals: conflictMode === 'replace' ? configs.filter(c => !mappedKeys.includes(c.key)) : [],
  };

  const handleApplyMapping = () => {
    if (conflictMode === 'replace') {
      setShowDestructiveConfirm(true);
    } else {
      importFromApiMapping(mappedDict, 'merge');
    }
  };

  const handleConfirmDestructiveReplace = () => {
    importFromApiMapping(mappedDict, 'replace');
    setShowDestructiveConfirm(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50/40 dark:bg-neutral-950 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Response Mapping & Configuration Import
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Extract configuration objects from external source API JSON payloads and map them into ConfigHub keys.
          </p>
        </div>

        <button
          onClick={handleApplyMapping}
          disabled={mappedKeys.length === 0}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-md transition-colors shadow-xs disabled:opacity-40"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Apply Mapped Configuration ({mappedKeys.length} keys)</span>
        </button>
      </div>

      {/* Selector and Strategy Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: JSONPath Expression */}
        <div className="lg:col-span-2 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
          <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
            Configuration JSONPath Selector
          </h2>
          <p className="text-[11px] text-neutral-500">
            Specify the location inside the response document containing the configuration object.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={jsonPath}
              onChange={e => setJsonPath(e.target.value)}
              placeholder="e.g. $.data.feature_flags"
              className="flex-1 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded font-mono text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
          </div>

          {/* Presets */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-neutral-400">Presets:</span>
            {presets.map(p => (
              <button
                key={p.path}
                onClick={() => setJsonPath(p.path)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  jsonPath === p.path
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Resolved Raw Preview */}
          <div className="mt-3 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-neutral-950 font-mono text-xs">
            <div className="p-2 bg-neutral-900 border-b border-neutral-800 text-neutral-400 text-[11px] flex justify-between">
              <span>Resolved Source Data at {jsonPath}</span>
              <span>{resolvedData ? 'Object Match' : 'Path Not Found'}</span>
            </div>
            <pre className="p-3 text-neutral-200 text-[11px] max-h-48 overflow-y-auto">
              {resolvedData ? formatJson(resolvedData) : '// No data resolved at path'}
            </pre>
          </div>
        </div>

        {/* Right: Mapping Controls & Conflict Mode */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
          <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
            Import Strategy
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Nested Object Handling
              </label>
              <select
                value={nestedHandling}
                onChange={e => setNestedHandling(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs"
              >
                <option value="flatten">Flatten to dot notation (e.g. data.flag)</option>
                <option value="nested_as_json">Keep as JSON Object values</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Sync Conflict Mode
              </label>
              <select
                value={conflictMode}
                onChange={e => setConflictMode(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs"
              >
                <option value="merge">Merge & Update (Preserve existing keys)</option>
                <option value="replace">Full Replace (Deletes absent keys)</option>
              </select>
            </div>
          </div>

          {/* Sync Impact Summary */}
          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 space-y-1.5">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
              Calculated Impact
            </span>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>New Keys to Add:</span>
              <span className="font-mono font-bold">{diffSummary.additions.length}</span>
            </div>
            <div className="flex justify-between text-amber-600 dark:text-amber-400">
              <span>Existing Keys to Update:</span>
              <span className="font-mono font-bold">{diffSummary.updates.length}</span>
            </div>
            {conflictMode === 'replace' && (
              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                <span>Existing Keys to Remove:</span>
                <span className="font-mono font-bold">{diffSummary.removals.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mapped Key-Value Preview Table */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
        <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
          Mapped Keys Preview ({mappedKeys.length} items)
        </h2>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-sans">
              <tr>
                <th className="p-2.5">Mapped Key Name</th>
                <th className="p-2.5">Extracted Value</th>
                <th className="p-2.5 w-28">Inferred Type</th>
                <th className="p-2.5 w-28">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {mappedKeys.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-neutral-400">
                    No keys resolved at path "{jsonPath}".
                  </td>
                </tr>
              ) : (
                mappedKeys.map(k => {
                  const val = mappedDict[k];
                  const isExisting = existingKeyMap.has(k);

                  return (
                    <tr key={k} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-850">
                      <td className="p-2.5 font-semibold text-neutral-900 dark:text-neutral-100">
                        {k}
                      </td>
                      <td className="p-2.5 text-neutral-600 dark:text-neutral-300 truncate max-w-md">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </td>
                      <td className="p-2.5 uppercase text-[10px] text-neutral-400 font-sans">
                        {inferValueType(val)}
                      </td>
                      <td className="p-2.5 font-sans">
                        {isExisting ? (
                          <span className="text-amber-600 dark:text-amber-400 font-medium text-[11px]">
                            Update
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                            Add New
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Destructive Warning Confirmation Modal */}
      {showDestructiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-md rounded-xl bg-white dark:bg-neutral-900 border border-rose-300 dark:border-rose-900 p-5 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Warning: Destructive Replacement</h3>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              You selected <strong>Full Replace</strong> mode. This action will permanently remove {diffSummary.removals.length} existing configuration keys that are not present in this external source payload.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setShowDestructiveConfirm(false)}
                className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDestructiveReplace}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded transition-colors"
              >
                Confirm Full Replace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
