import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { 
  X, 
  Plus, 
  Upload, 
  FileCode, 
  Check, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { ConfigValueType } from '../../types/config';
import { validateJsonString, flattenObject, formatJson, inferValueType } from '../../utils/jsonUtils';

export const AddConfigModal: React.FC = () => {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    folders,
    configs,
    activeEnvironment,
    createConfigItem,
    bulkImportJson,
    addToast
  } = useConfig();

  const [mode, setMode] = useState<'single' | 'import'>('single');

  // Single key form
  const [keyName, setKeyName] = useState('');
  const [keyType, setKeyType] = useState<ConfigValueType>('string');
  const [folderId, setFolderId] = useState('general');
  const [description, setDescription] = useState('');
  const [singleValue, setSingleValue] = useState<any>('');
  const [singleKeyError, setSingleKeyError] = useState('');

  // Bulk JSON import form
  const [rawJson, setRawJson] = useState(`{
  "max_search_results": 25,
  "enable_ai_assist": true,
  "client_theme": {
    "primary_color": "#10b981",
    "border_radius": 8
  },
  "blocked_country_codes": ["KP", "IR"]
}`);
  const [nestedStrategy, setNestedStrategy] = useState<'keep_nested' | 'flatten'>('keep_nested');
  const [conflictStrategy, setConflictStrategy] = useState<'skip' | 'overwrite'>('overwrite');
  const [importPreview, setImportPreview] = useState<Array<{ key: string; value: any; type: ConfigValueType; status: 'new' | 'conflict' }> | null>(null);
  const [importJsonError, setImportJsonError] = useState<string | null>(null);

  if (!isAddModalOpen) return null;

  // Single key submission
  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = keyName.trim();
    if (!cleanKey) {
      setSingleKeyError('Configuration key cannot be empty');
      return;
    }
    // Validation on key identifier format
    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanKey)) {
      setSingleKeyError('Key may only contain letters, numbers, underscores, dashes, and periods');
      return;
    }

    let parsedVal = singleValue;
    if (keyType === 'number') {
      parsedVal = parseFloat(singleValue) || 0;
    } else if (keyType === 'boolean') {
      parsedVal = singleValue === 'true' || singleValue === true;
    } else if (keyType === 'null') {
      parsedVal = null;
    } else if (keyType === 'json_object' || keyType === 'json_array') {
      const check = validateJsonString(singleValue);
      if (!check.isValid) {
        setSingleKeyError(check.error?.message || 'Invalid JSON syntax');
        return;
      }
      parsedVal = check.parsed;
    }

    const success = createConfigItem({
      key: cleanKey,
      folderId,
      type: keyType,
      description,
      defaultValue: parsedVal,
      values: {
        development: parsedVal,
        staging: parsedVal,
        production: parsedVal,
      },
      tags: ['manual-entry'],
    });

    if (success) {
      setIsAddModalOpen(false);
      resetSingleForm();
    }
  };

  const resetSingleForm = () => {
    setKeyName('');
    setKeyType('string');
    setDescription('');
    setSingleValue('');
    setSingleKeyError('');
  };

  // Analyze JSON for Bulk Import
  const handleAnalyzeJson = () => {
    setImportJsonError(null);
    const check = validateJsonString(rawJson);
    if (!check.isValid || !check.parsed) {
      setImportJsonError(check.error?.message || 'Malformed JSON');
      setImportPreview(null);
      return;
    }

    const parsed = check.parsed;
    if (typeof parsed !== 'object' || parsed === null) {
      setImportJsonError('Root JSON payload must be an object containing key-value pairs.');
      setImportPreview(null);
      return;
    }

    const existingKeys = new Set(configs.map(c => c.key));
    const items: Array<{ key: string; value: any; type: ConfigValueType; status: 'new' | 'conflict' }> = [];

    if (nestedStrategy === 'flatten') {
      const flattened = flattenObject(parsed);
      for (const [k, v] of Object.entries(flattened)) {
        items.push({
          key: k,
          value: v,
          type: inferValueType(v),
          status: existingKeys.has(k) ? 'conflict' : 'new',
        });
      }
    } else {
      for (const [k, v] of Object.entries(parsed)) {
        items.push({
          key: k,
          value: v,
          type: inferValueType(v),
          status: existingKeys.has(k) ? 'conflict' : 'new',
        });
      }
    }

    setImportPreview(items);
  };

  // Execute Bulk Import
  const handleExecuteImport = () => {
    if (!importPreview || importPreview.length === 0) return;

    const payload = importPreview.map(p => ({
      key: p.key,
      value: p.value,
      type: p.type,
      folderId: folderId || 'general',
      description: 'Imported via Bulk JSON Import',
    }));

    const result = bulkImportJson(payload, conflictStrategy);

    addToast({
      title: 'Bulk import applied',
      description: `Imported ${result.added} new keys, updated ${result.updated}, and skipped ${result.skipped}.`,
      type: 'success',
    });

    setIsAddModalOpen(false);
    setImportPreview(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Mode Switcher */}
        <div className="px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-950/50">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Add Configuration
              </h3>
              <p className="text-[11px] text-neutral-500">
                Create a new key or import batch configurations from JSON
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(false)}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-5 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium">
          <button
            onClick={() => setMode('single')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              mode === 'single'
                ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Single Key
          </button>
          <button
            onClick={() => setMode('import')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              mode === 'import'
                ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Bulk JSON Import
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {mode === 'single' ? (
            /* Mode 1: Single Key */
            <form id="single-key-form" onSubmit={handleSingleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Key Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. max_connections_limit"
                    value={keyName}
                    onChange={e => {
                      setKeyName(e.target.value);
                      setSingleKeyError('');
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded font-mono text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Data Type
                  </label>
                  <select
                    value={keyType}
                    onChange={e => {
                      const t = e.target.value as ConfigValueType;
                      setKeyType(t);
                      if (t === 'boolean') setSingleValue('true');
                      else if (t === 'number') setSingleValue('0');
                      else if (t === 'null') setSingleValue('null');
                      else if (t === 'json_object') setSingleValue('{}');
                      else if (t === 'json_array') setSingleValue('[]');
                      else setSingleValue('');
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  >
                    <option value="string">String</option>
                    <option value="boolean">Boolean</option>
                    <option value="number">Number</option>
                    <option value="json_object">JSON Object</option>
                    <option value="json_array">JSON Array</option>
                    <option value="null">Null</option>
                  </select>
                </div>
              </div>

              {singleKeyError && (
                <p className="text-rose-600 dark:text-rose-400 text-[11px] font-medium">
                  {singleKeyError}
                </p>
              )}

              {/* Value Input by Type */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Initial Value ({activeEnvironment})
                </label>
                {keyType === 'boolean' ? (
                  <select
                    value={String(singleValue)}
                    onChange={e => setSingleValue(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded font-mono text-xs"
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : keyType === 'number' ? (
                  <input
                    type="number"
                    value={singleValue}
                    onChange={e => setSingleValue(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded font-mono text-xs"
                    placeholder="0"
                  />
                ) : keyType === 'null' ? (
                  <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded font-mono text-neutral-500 italic">
                    null
                  </div>
                ) : keyType === 'json_object' || keyType === 'json_array' ? (
                  <textarea
                    rows={5}
                    value={singleValue}
                    onChange={e => setSingleValue(e.target.value)}
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-700 rounded font-mono text-xs text-neutral-100 focus:outline-none"
                    placeholder={keyType === 'json_object' ? '{\n  "enabled": true\n}' : '[\n  "item1", "item2"\n]'}
                  />
                ) : (
                  <input
                    type="text"
                    value={singleValue}
                    onChange={e => setSingleValue(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs"
                    placeholder="String value"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Destination Folder
                  </label>
                  <select
                    value={folderId}
                    onChange={e => setFolderId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  >
                    <option value="root">Unassigned</option>
                    {folders.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Purpose of this configuration..."
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs"
                  />
                </div>
              </div>
            </form>
          ) : (
            /* Mode 2: Bulk JSON Import */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Paste Raw Configuration JSON
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(rawJson);
                        setRawJson(JSON.stringify(parsed, null, 2));
                      } catch {}
                    }}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Format JSON
                  </button>
                </div>

                <textarea
                  rows={7}
                  value={rawJson}
                  onChange={e => {
                    setRawJson(e.target.value);
                    setImportPreview(null);
                    setImportJsonError(null);
                  }}
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded font-mono text-xs text-neutral-100 focus:outline-none"
                  spellCheck={false}
                />
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Nested Objects Strategy
                  </label>
                  <select
                    value={nestedStrategy}
                    onChange={e => {
                      setNestedStrategy(e.target.value as any);
                      setImportPreview(null);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs"
                  >
                    <option value="keep_nested">Keep as JSON Object</option>
                    <option value="flatten">Flatten (e.g. client.primary_color)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Conflict Resolution
                  </label>
                  <select
                    value={conflictStrategy}
                    onChange={e => setConflictStrategy(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs"
                  >
                    <option value="overwrite">Overwrite existing keys</option>
                    <option value="skip">Skip existing keys</option>
                  </select>
                </div>
              </div>

              {/* Error Callout */}
              {importJsonError && (
                <div className="p-3 rounded-lg border border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{importJsonError}</span>
                </div>
              )}

              {/* Analyze Button */}
              {!importPreview && (
                <button
                  type="button"
                  onClick={handleAnalyzeJson}
                  className="w-full py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-semibold rounded transition-colors text-xs"
                >
                  Analyze & Preview Keys
                </button>
              )}

              {/* Import Preview Table */}
              {importPreview && (
                <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Import Preview ({importPreview.length} items detected)
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {importPreview.filter(p => p.status === 'conflict').length} existing conflicts
                    </span>
                  </div>

                  <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg max-h-44 overflow-y-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-[11px]">
                        <tr>
                          <th className="p-2">Key</th>
                          <th className="p-2">Type</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {importPreview.map((item, i) => (
                          <tr key={i}>
                            <td className="p-2 font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-xs">
                              {item.key}
                            </td>
                            <td className="p-2 text-neutral-500 uppercase text-[10px]">
                              {item.type}
                            </td>
                            <td className="p-2">
                              {item.status === 'conflict' ? (
                                <span className="text-amber-600 dark:text-amber-400 font-sans font-medium text-[11px]">
                                  {conflictStrategy === 'overwrite' ? 'Will overwrite' : 'Will skip'}
                                </span>
                              ) : (
                                <span className="text-emerald-600 dark:text-emerald-400 font-sans font-medium text-[11px]">
                                  New
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(false)}
            className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
          >
            Cancel
          </button>

          {mode === 'single' ? (
            <button
              type="submit"
              form="single-key-form"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Create Configuration</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={!importPreview || importPreview.length === 0}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded transition-colors shadow-xs ${
                !importPreview || importPreview.length === 0
                  ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Apply Import ({importPreview ? importPreview.length : 0} keys)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
