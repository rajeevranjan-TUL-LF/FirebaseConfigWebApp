import React, { useState, useEffect } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { 
  X, 
  Check, 
  RotateCcw, 
  AlertTriangle, 
  Layers, 
  Code2, 
  ListTree, 
  Sparkles, 
  Sliders, 
  Folder as FolderIcon,
  HelpCircle,
  Copy,
  ChevronRight,
  ChevronDown,
  Info
} from 'lucide-react';
import { ConfigItem, ConfigValueType, ConfigEnvironment } from '../../types/config';
import { validateJsonString, formatJson, minifyJson, JsonValidationError } from '../../utils/jsonUtils';

export const ConfigEditorDrawer: React.FC = () => {
  const {
    selectedConfigId,
    setSelectedConfigId,
    configs,
    folders,
    activeEnvironment,
    saveDraftConfig,
    updateConfigItem,
    addToast
  } = useConfig();

  const item = configs.find(c => c.id === selectedConfigId);

  // Local state for the editor
  const [keyName, setKeyName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedType, setSelectedType] = useState<ConfigValueType>('string');
  const [activeTab, setActiveTab] = useState<'value' | 'overrides' | 'rules'>('value');
  
  // Value editors
  const [editingEnv, setEditingEnv] = useState<ConfigEnvironment>(activeEnvironment);
  const [stringVal, setStringVal] = useState('');
  const [boolVal, setBoolVal] = useState(false);
  const [numberVal, setNumberVal] = useState<number>(0);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<JsonValidationError | null>(null);
  const [editorMode, setEditorMode] = useState<'raw' | 'tree'>('raw');
  
  // Validation constraints
  const [minConstraint, setMinConstraint] = useState<string>('');
  const [maxConstraint, setMaxConstraint] = useState<string>('');
  const [regexPattern, setRegexPattern] = useState<string>('');
  const [isRequired, setIsRequired] = useState(true);

  // Synchronize when opening an item or changing environment
  useEffect(() => {
    if (item) {
      setKeyName(item.key);
      setDescription(item.description || '');
      setSelectedFolder(item.folderId);
      setSelectedType(item.type);
      setEditingEnv(activeEnvironment);

      const currentEnvVal = item.draftValues?.[activeEnvironment] !== undefined
        ? item.draftValues[activeEnvironment]
        : item.values[activeEnvironment];

      if (item.type === 'boolean') {
        setBoolVal(Boolean(currentEnvVal));
      } else if (item.type === 'number') {
        setNumberVal(Number(currentEnvVal) || 0);
      } else if (item.type === 'string') {
        setStringVal(String(currentEnvVal ?? ''));
      } else if (item.type === 'json_object' || item.type === 'json_array') {
        setJsonText(formatJson(currentEnvVal));
        setJsonError(null);
      }

      setMinConstraint(item.validationRule?.min !== undefined ? String(item.validationRule.min) : '');
      setMaxConstraint(item.validationRule?.max !== undefined ? String(item.validationRule.max) : '');
      setRegexPattern(item.validationRule?.pattern || '');
      setIsRequired(item.validationRule?.required ?? true);
    }
  }, [item, selectedConfigId, activeEnvironment]);

  // Handle environment tab switch within editor
  const handleSwitchEditingEnv = (env: ConfigEnvironment) => {
    if (!item) return;
    setEditingEnv(env);
    const val = item.draftValues?.[env] !== undefined ? item.draftValues[env] : item.values[env];

    if (item.type === 'boolean') {
      setBoolVal(Boolean(val));
    } else if (item.type === 'number') {
      setNumberVal(Number(val) || 0);
    } else if (item.type === 'string') {
      setStringVal(String(val ?? ''));
    } else if (item.type === 'json_object' || item.type === 'json_array') {
      setJsonText(formatJson(val));
      setJsonError(null);
    }
  };

  if (!item) return null;

  // JSON live validation
  const handleJsonChange = (text: string) => {
    setJsonText(text);
    const check = validateJsonString(text);
    if (!check.isValid && check.error) {
      setJsonError(check.error);
    } else {
      setJsonError(null);
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      // Keep error
    }
  };

  const handleMinifyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed));
      setJsonError(null);
    } catch {}
  };

  // Determine current effective value
  const getPreparedValue = () => {
    if (selectedType === 'boolean') return boolVal;
    if (selectedType === 'number') return Number(numberVal);
    if (selectedType === 'null') return null;
    if (selectedType === 'json_object' || selectedType === 'json_array') {
      try {
        return JSON.parse(jsonText);
      } catch {
        return null;
      }
    }
    return stringVal;
  };

  const hasBlockingError = () => {
    if ((selectedType === 'json_object' || selectedType === 'json_array') && jsonError) {
      return true;
    }
    if (selectedType === 'number') {
      if (isNaN(numberVal)) return true;
      if (minConstraint && numberVal < parseFloat(minConstraint)) return true;
      if (maxConstraint && numberVal > parseFloat(maxConstraint)) return true;
    }
    if (selectedType === 'string' && regexPattern) {
      try {
        const re = new RegExp(regexPattern);
        if (!re.test(stringVal)) return true;
      } catch {
        return true;
      }
    }
    return false;
  };

  const handleSave = () => {
    if (hasBlockingError()) return;

    const finalVal = getPreparedValue();
    saveDraftConfig(item.id, finalVal, {
      description,
      folderId: selectedFolder,
      type: selectedType,
      validationRule: {
        required: isRequired,
        min: minConstraint ? parseFloat(minConstraint) : undefined,
        max: maxConstraint ? parseFloat(maxConstraint) : undefined,
        pattern: regexPattern || undefined,
      },
    });

    setSelectedConfigId(null);
  };

  const handleResetToPublished = () => {
    const publishedVal = item.values[editingEnv];
    if (selectedType === 'boolean') setBoolVal(Boolean(publishedVal));
    else if (selectedType === 'number') setNumberVal(Number(publishedVal) || 0);
    else if (selectedType === 'string') setStringVal(String(publishedVal ?? ''));
    else if (selectedType === 'json_object' || selectedType === 'json_array') {
      setJsonText(formatJson(publishedVal));
      setJsonError(null);
    }
    addToast({ title: 'Reverted', description: 'Reset editor to active published value.', type: 'info' });
  };

  const lineCount = (selectedType === 'json_object' || selectedType === 'json_array') 
    ? jsonText.split('\n').length 
    : 1;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-xl bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col select-none">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-950/50">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
              {item.key}
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 uppercase">
              {item.type}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
            Scope: {editingEnv} · Version {item.version}
          </p>
        </div>

        <button
          onClick={() => setSelectedConfigId(null)}
          className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded"
          aria-label="Close configuration drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center px-5 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('value')}
          className={`py-2 px-3 border-b-2 transition-colors ${
            activeTab === 'value'
              ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100 font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          Value Editor
        </button>
        <button
          onClick={() => setActiveTab('overrides')}
          className={`py-2 px-3 border-b-2 transition-colors ${
            activeTab === 'overrides'
              ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100 font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          Environments Comparison
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`py-2 px-3 border-b-2 transition-colors ${
            activeTab === 'rules'
              ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100 font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          Validation Rules
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        {activeTab === 'value' && (
          <>
            {/* Environment Selector within Drawer */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
              <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                Targeting Environment:
              </span>
              <div className="flex items-center gap-1">
                {(['development', 'staging', 'production'] as ConfigEnvironment[]).map(env => (
                  <button
                    key={env}
                    onClick={() => handleSwitchEditingEnv(env)}
                    className={`px-2 py-0.5 rounded text-[11px] capitalize font-medium transition-colors ${
                      editingEnv === env
                        ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                    }`}
                  >
                    {env === 'development' ? 'Dev' : env === 'staging' ? 'Stage' : 'Prod'}
                  </button>
                ))}
              </div>
            </div>

            {/* Folder & Type Controls */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Folder Assignment
                </label>
                <select
                  value={selectedFolder}
                  onChange={e => setSelectedFolder(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 focus:outline-none"
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
                  Data Type
                </label>
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value as ConfigValueType)}
                  className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 focus:outline-none"
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

            {/* Specific Type Editors */}
            <div className="pt-2">
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Configuration Value
              </label>

              {/* Boolean Structured Editor */}
              {selectedType === 'boolean' && (
                <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                      State: {boolVal ? 'Enabled (true)' : 'Disabled (false)'}
                    </span>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Toggle active flag for {editingEnv} scope
                    </p>
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg">
                    <button
                      onClick={() => setBoolVal(true)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        boolVal ? 'bg-emerald-600 text-white shadow-xs' : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      True
                    </button>
                    <button
                      onClick={() => setBoolVal(false)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        !boolVal ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs' : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      False
                    </button>
                  </div>
                </div>
              )}

              {/* Number Structured Editor */}
              {selectedType === 'number' && (
                <div className="space-y-2">
                  <input
                    type="number"
                    value={numberVal}
                    onChange={e => setNumberVal(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded font-mono text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                  {(minConstraint || maxConstraint) && (
                    <p className="text-[11px] text-neutral-400">
                      Permitted range: [{minConstraint || '-∞'}, {maxConstraint || '+∞'}]
                    </p>
                  )}
                </div>
              )}

              {/* Null Editor */}
              {selectedType === 'null' && (
                <div className="p-4 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/50 text-center text-xs text-neutral-500">
                  Explicitly configured as <code className="font-mono font-bold text-neutral-700 dark:text-neutral-300">null</code>
                </div>
              )}

              {/* String Editor */}
              {selectedType === 'string' && (
                <textarea
                  rows={4}
                  value={stringVal}
                  onChange={e => setStringVal(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded font-mono text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  placeholder="Enter string value..."
                />
              )}

              {/* JSON Editor with Syntax Validator & Line Numbers */}
              {(selectedType === 'json_object' || selectedType === 'json_array') && (
                <div className="space-y-2">
                  {/* JSON Editor Controls */}
                  <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-t-lg border border-b-0 border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditorMode('raw')}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          editorMode === 'raw'
                            ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                            : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                        }`}
                      >
                        Code Editor
                      </button>
                      <button
                        onClick={() => setEditorMode('tree')}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          editorMode === 'tree'
                            ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                            : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                        }`}
                      >
                        Tree Inspector
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleFormatJson}
                        className="px-2 py-0.5 text-[11px] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
                        title="Indent and format JSON"
                      >
                        Format
                      </button>
                      <button
                        type="button"
                        onClick={handleMinifyJson}
                        className="px-2 py-0.5 text-[11px] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
                        title="Minify JSON"
                      >
                        Minify
                      </button>
                    </div>
                  </div>

                  {editorMode === 'raw' ? (
                    <div className="relative border border-neutral-200 dark:border-neutral-700 rounded-b-lg overflow-hidden bg-neutral-950 font-mono text-xs text-neutral-200 flex">
                      {/* Line Numbers */}
                      <div className="w-10 select-none py-2 px-1 text-right text-neutral-600 dark:text-neutral-600 bg-neutral-900/80 border-r border-neutral-800 text-[11px] leading-relaxed">
                        {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
                          <div key={i}>{i + 1}</div>
                        ))}
                      </div>

                      {/* Code Textarea */}
                      <textarea
                        rows={10}
                        value={jsonText}
                        onChange={e => handleJsonChange(e.target.value)}
                        className="flex-1 bg-transparent p-2 leading-relaxed text-neutral-100 placeholder-neutral-500 focus:outline-none resize-y font-mono text-[11px]"
                        spellCheck={false}
                      />
                    </div>
                  ) : (
                    /* Structured Tree View Mode */
                    <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-b-lg bg-neutral-900 text-neutral-100 font-mono text-xs max-h-64 overflow-y-auto">
                      <pre className="text-emerald-400">{jsonText}</pre>
                    </div>
                  )}

                  {/* Validation Error Banner */}
                  {jsonError && (
                    <div className="p-2.5 rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">
                          Syntax Error at Line {jsonError.line}, Column {jsonError.column}
                        </p>
                        <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
                          {jsonError.message}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Description & Developer Notes
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Explain what this configuration key controls..."
                className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 focus:outline-none"
              />
            </div>
          </>
        )}

        {/* Tab 2: Environment Overrides Matrix */}
        {activeTab === 'overrides' && (
          <div className="space-y-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              ConfigHub maintains independent configuration values for each environment. You can review and promote values between tiers:
            </p>

            {(['development', 'staging', 'production'] as ConfigEnvironment[]).map(env => {
              const liveVal = item.values[env];
              const draftVal = item.draftValues?.[env];
              const displayVal = draftVal !== undefined ? draftVal : liveVal;
              const isCurrent = editingEnv === env;

              return (
                <div 
                  key={env}
                  className={`p-3 rounded-lg border transition-all ${
                    isCurrent 
                      ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50/70 dark:bg-neutral-900/80' 
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="capitalize font-semibold text-neutral-900 dark:text-neutral-100">
                        {env}
                      </span>
                      {draftVal !== undefined && (
                        <span className="text-[10px] text-amber-600 font-medium font-mono">
                          (Pending Draft)
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleSwitchEditingEnv(env)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit in this scope
                    </button>
                  </div>

                  <div className="p-2 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-[11px] text-neutral-800 dark:text-neutral-200 truncate">
                    {typeof displayVal === 'object' ? JSON.stringify(displayVal) : String(displayVal)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Validation Rules */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
              <div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Required Value
                </span>
                <p className="text-[11px] text-neutral-500">
                  Reject null or undefined configurations
                </p>
              </div>
              <input
                type="checkbox"
                checked={isRequired}
                onChange={e => setIsRequired(e.target.checked)}
                className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900"
              />
            </div>

            {selectedType === 'number' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Minimum Allowed
                  </label>
                  <input
                    type="number"
                    value={minConstraint}
                    onChange={e => setMinConstraint(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Maximum Allowed
                  </label>
                  <input
                    type="number"
                    value={maxConstraint}
                    onChange={e => setMaxConstraint(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs"
                  />
                </div>
              </div>
            )}

            {selectedType === 'string' && (
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Regex Pattern Constraint
                </label>
                <input
                  type="text"
                  value={regexPattern}
                  onChange={e => setRegexPattern(e.target.value)}
                  placeholder="e.g. ^https?:// for URLs"
                  className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded font-mono text-xs"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-between">
        <button
          onClick={handleResetToPublished}
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to live</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedConfigId(null)}
            className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={hasBlockingError()}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded transition-colors shadow-xs ${
              hasBlockingError()
                ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Draft ({editingEnv})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
