import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  CopyPlus, 
  MoreHorizontal, 
  FileJson, 
  Plus, 
  FolderInput, 
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye
} from 'lucide-react';
import { ConfigItem, ConfigValueType } from '../../types/config';
import { formatJson } from '../../utils/jsonUtils';

export const ConfigTable: React.FC = () => {
  const {
    configs,
    folders,
    selectedFolderId,
    activeEnvironment,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    modifiedFilter,
    setModifiedFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selectedKeyIds,
    toggleSelectKey,
    selectAllKeys,
    clearKeySelection,
    setSelectedConfigId,
    setIsAddModalOpen,
    deleteConfigItem,
    duplicateConfigItem,
    bulkMoveToFolder,
    bulkDeleteKeys,
    saveDraftConfig,
    addToast,
  } = useConfig();

  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [copiedValId, setCopiedValId] = useState<string | null>(null);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [bulkFolderTarget, setBulkFolderTarget] = useState<string>('');
  const [expandedJsonId, setExpandedJsonId] = useState<string | null>(null);

  // Folder helper
  const getFolderName = (folderId: string) => {
    return folders.find(f => f.id === folderId)?.name || 'Unassigned';
  };

  // Filter configurations
  const filteredConfigs = configs.filter(c => {
    // 1. Folder filter
    if (selectedFolderId) {
      if (selectedFolderId === 'root') {
        if (c.folderId && c.folderId !== 'root') return false;
      } else {
        // Match direct or nested folders
        const getAllSubfolderIds = (fid: string): string[] => {
          const subs = folders.filter(f => f.parentId === fid).map(f => f.id);
          return [fid, ...subs.flatMap(getAllSubfolderIds)];
        };
        const allowed = getAllSubfolderIds(selectedFolderId);
        if (!allowed.includes(c.folderId)) return false;
      }
    }

    // 2. Type filter
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;

    // 3. Modified status filter
    if (modifiedFilter === 'draft') {
      const currentVal = c.values[activeEnvironment];
      const draftVal = c.draftValues?.[activeEnvironment];
      const isPending = draftVal !== undefined && JSON.stringify(currentVal) !== JSON.stringify(draftVal);
      if (!isPending) return false;
    } else if (modifiedFilter === 'published') {
      const currentVal = c.values[activeEnvironment];
      const draftVal = c.draftValues?.[activeEnvironment];
      const isPending = draftVal !== undefined && JSON.stringify(currentVal) !== JSON.stringify(draftVal);
      if (isPending) return false;
    }

    // 4. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inKey = c.key.toLowerCase().includes(q);
      const inDesc = c.description.toLowerCase().includes(q);
      const val = c.draftValues?.[activeEnvironment] !== undefined ? c.draftValues[activeEnvironment] : c.values[activeEnvironment];
      const inVal = typeof val === 'object' ? JSON.stringify(val).toLowerCase().includes(q) : String(val).toLowerCase().includes(q);
      return inKey || inDesc || inVal;
    }

    return true;
  });

  // Sorting
  const sortedConfigs = [...filteredConfigs].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'key') {
      cmp = a.key.localeCompare(b.key);
    } else if (sortBy === 'type') {
      cmp = a.type.localeCompare(b.type);
    } else if (sortBy === 'lastModified') {
      cmp = new Date(b.lastModifiedAt).getTime() - new Date(a.lastModifiedAt).getTime();
    }
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const allFilteredSelected = sortedConfigs.length > 0 && sortedConfigs.every(c => selectedKeyIds.has(c.id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      clearKeySelection();
    } else {
      selectAllKeys(sortedConfigs.map(c => c.id));
    }
  };

  const handleCopyKey = (key: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 1500);
    addToast({ title: 'Key copied', description: `Copied "${key}" to clipboard.`, type: 'info' });
  };

  const handleCopyValue = (val: any, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const str = typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
    navigator.clipboard.writeText(str);
    setCopiedValId(id);
    setTimeout(() => setCopiedValId(null), 1500);
    addToast({ title: 'Value copied', description: 'Configuration value copied to clipboard.', type: 'info' });
  };

  const handleQuickToggleBoolean = (item: ConfigItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = item.draftValues?.[activeEnvironment] !== undefined
      ? item.draftValues[activeEnvironment]
      : item.values[activeEnvironment];
    saveDraftConfig(item.id, !current);
  };

  const handleBulkExport = () => {
    const selected = configs.filter(c => selectedKeyIds.has(c.id));
    const exportMap: Record<string, any> = {};
    selected.forEach(c => {
      exportMap[c.key] = c.values[activeEnvironment];
    });
    const blob = new Blob([JSON.stringify(exportMap, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `confighub-${activeEnvironment}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: 'Export generated', description: `Exported ${selected.length} configurations to JSON.`, type: 'success' });
  };

  // Render type indicator
  const renderTypeTag = (type: ConfigValueType) => {
    const typeStyles: Record<ConfigValueType, { label: string; style: string }> = {
      boolean: { label: 'Boolean', style: 'text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800' },
      number: { label: 'Number', style: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
      string: { label: 'String', style: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
      json_object: { label: 'JSON Object', style: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
      json_array: { label: 'JSON Array', style: 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' },
      null: { label: 'Null', style: 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700' },
    };

    const config = typeStyles[type] || typeStyles.string;
    return (
      <span className={`inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium rounded border ${config.style}`}>
        {config.label}
      </span>
    );
  };

  // Render value preview
  const renderValuePreview = (item: ConfigItem) => {
    const isPendingDraft = item.draftValues?.[activeEnvironment] !== undefined &&
      JSON.stringify(item.draftValues[activeEnvironment]) !== JSON.stringify(item.values[activeEnvironment]);

    const activeVal = isPendingDraft ? item.draftValues![activeEnvironment] : item.values[activeEnvironment];

    if (item.type === 'boolean') {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={e => handleQuickToggleBoolean(item, e)}
            className={`w-7 h-4 rounded-full p-0.5 transition-colors ${
              activeVal ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'
            }`}
            title="Click to toggle draft boolean"
          >
            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
              activeVal ? 'translate-x-3' : 'translate-x-0'
            }`} />
          </button>
          <span className={`font-mono text-xs font-semibold ${
            activeVal ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500'
          }`}>
            {activeVal ? 'true' : 'false'}
          </span>
          {isPendingDraft && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              (draft)
            </span>
          )}
        </div>
      );
    }

    if (item.type === 'number') {
      return (
        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100">
          <span>{activeVal}</span>
          {isPendingDraft && (
            <span className="text-[10px] font-sans text-amber-600 dark:text-amber-400 font-medium">
              (draft)
            </span>
          )}
        </div>
      );
    }

    if (item.type === 'null') {
      return (
        <span className="font-mono text-xs italic text-neutral-400 dark:text-neutral-500">
          null
        </span>
      );
    }

    if (item.type === 'json_object' || item.type === 'json_array') {
      const compactJson = JSON.stringify(activeVal);
      return (
        <div className="flex items-center gap-2 max-w-xs truncate">
          <code className="text-[11px] font-mono text-purple-700 dark:text-purple-300 truncate bg-purple-50/50 dark:bg-purple-950/20 px-1 py-0.5 rounded">
            {compactJson}
          </code>
          <button
            onClick={e => {
              e.stopPropagation();
              setExpandedJsonId(expandedJsonId === item.id ? null : item.id);
            }}
            className="text-[10px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 shrink-0 underline"
          >
            {expandedJsonId === item.id ? 'Collapse' : 'Inspect'}
          </button>
          {isPendingDraft && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              (draft)
            </span>
          )}
        </div>
      );
    }

    // Default string
    return (
      <div className="flex items-center gap-1.5 truncate max-w-sm">
        <span className="font-mono text-xs text-neutral-800 dark:text-neutral-200 truncate">
          "{String(activeVal)}"
        </span>
        {isPendingDraft && (
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium shrink-0">
            (draft)
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-950 overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/30">
        {/* Left: Search and Filters */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {/* Search Input */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs w-64 shadow-xs">
            <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <input
              type="text"
              placeholder="Filter by key or value..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none text-xs font-mono"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="string">String</option>
              <option value="boolean">Boolean</option>
              <option value="number">Number</option>
              <option value="json_object">JSON Object</option>
              <option value="json_array">JSON Array</option>
              <option value="null">Null</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <select
              value={modifiedFilter}
              onChange={e => setModifiedFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Pending Drafts</option>
              <option value="published">Published Live</option>
            </select>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-md transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Configuration</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar (if any keys selected) */}
      {selectedKeyIds.size > 0 && (
        <div className="px-4 py-2 bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-between text-xs transition-all">
          <div className="flex items-center gap-3">
            <span className="font-semibold">
              {selectedKeyIds.size} configuration {selectedKeyIds.size === 1 ? 'key' : 'keys'} selected
            </span>
            <button
              onClick={clearKeySelection}
              className="text-neutral-400 hover:text-white underline text-[11px]"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Move to folder */}
            <select
              value={bulkFolderTarget}
              onChange={e => {
                if (e.target.value) {
                  bulkMoveToFolder(Array.from(selectedKeyIds), e.target.value);
                  setBulkFolderTarget('');
                }
              }}
              className="px-2 py-1 rounded bg-neutral-800 dark:bg-neutral-700 border border-neutral-700 text-xs text-white focus:outline-none"
            >
              <option value="">Move to Folder...</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleBulkExport}
              className="px-2.5 py-1 rounded bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-700 text-neutral-200 transition-colors"
            >
              Export JSON
            </button>

            <button
              onClick={() => bulkDeleteKeys(Array.from(selectedKeyIds))}
              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 sticky top-0 z-10 text-neutral-500 dark:text-neutral-400 font-semibold select-none">
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={handleToggleSelectAll}
                  className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0"
                />
              </th>

              <th 
                className="px-3 py-2.5 cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                onClick={() => {
                  if (sortBy === 'key') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  else { setSortBy('key'); setSortOrder('asc'); }
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span>Configuration Key</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>

              <th className="px-3 py-2.5">
                <span>Value Preview ({activeEnvironment})</span>
              </th>

              <th 
                className="w-28 px-3 py-2.5 cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                onClick={() => {
                  if (sortBy === 'type') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  else { setSortBy('type'); setSortOrder('asc'); }
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span>Type</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>

              <th className="w-32 px-3 py-2.5">
                <span>Folder</span>
              </th>

              <th 
                className="w-36 px-3 py-2.5 cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                onClick={() => {
                  if (sortBy === 'lastModified') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  else { setSortBy('lastModified'); setSortOrder('asc'); }
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span>Last Modified</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>

              <th className="w-20 px-3 py-2.5 text-right">
                <span>Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-200/80 dark:divide-neutral-800/80">
            {sortedConfigs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="max-w-sm mx-auto space-y-2">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      No configurations found
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      {searchQuery
                        ? `No keys match your query "${searchQuery}". Clear your search or filter.`
                        : 'This folder is currently empty. Add your first configuration key.'}
                    </p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Configuration Key</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              sortedConfigs.map(item => {
                const isSelected = selectedKeyIds.has(item.id);
                const isExpanded = expandedJsonId === item.id;
                const activeVal = item.draftValues?.[activeEnvironment] !== undefined
                  ? item.draftValues[activeEnvironment]
                  : item.values[activeEnvironment];

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      onClick={() => setSelectedConfigId(item.id)}
                      className={`group hover:bg-neutral-50 dark:hover:bg-neutral-900/50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-neutral-100/70 dark:bg-neutral-900' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectKey(item.id)}
                          className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0"
                        />
                      </td>

                      {/* Key */}
                      <td className="px-3 py-2.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                            {item.key}
                          </span>
                          <button
                            onClick={e => handleCopyKey(item.key, item.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-opacity p-0.5"
                            title="Copy key name"
                          >
                            {copiedKeyId === item.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-sm">
                            {item.description}
                          </p>
                        )}
                      </td>

                      {/* Value Preview */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          {renderValuePreview(item)}
                          <button
                            onClick={e => handleCopyValue(activeVal, item.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-opacity p-0.5"
                            title="Copy value"
                          >
                            {copiedValId === item.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-3 py-2.5">
                        {renderTypeTag(item.type)}
                      </td>

                      {/* Folder */}
                      <td className="px-3 py-2.5 text-neutral-600 dark:text-neutral-400 truncate">
                        {getFolderName(item.folderId)}
                      </td>

                      {/* Last Modified */}
                      <td className="px-3 py-2.5 font-mono text-[11px] text-neutral-500 dark:text-neutral-400 tabular-nums">
                        <div>{new Date(item.lastModifiedAt).toLocaleDateString()}</div>
                        <div className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">
                          {item.lastModifiedBy}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-2.5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setActiveActionId(activeActionId === item.id ? null : item.id)}
                            className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {activeActionId === item.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl z-30 p-1 text-xs">
                              <button
                                onClick={() => {
                                  setSelectedConfigId(item.id);
                                  setActiveActionId(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
                                Edit Key
                              </button>
                              <button
                                onClick={() => {
                                  duplicateConfigItem(item.id);
                                  setActiveActionId(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                              >
                                <CopyPlus className="w-3.5 h-3.5 text-neutral-400" />
                                Duplicate
                              </button>
                              <button
                                onClick={() => {
                                  deleteConfigItem(item.id);
                                  setActiveActionId(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable JSON Detail View */}
                    {isExpanded && (item.type === 'json_object' || item.type === 'json_array') && (
                      <tr className="bg-neutral-50/70 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800">
                        <td colSpan={7} className="px-6 py-3">
                          <div className="p-3 rounded-lg bg-neutral-900 text-neutral-200 font-mono text-xs overflow-x-auto max-h-52">
                            <pre>{formatJson(activeVal)}</pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Status Bar */}
      <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 text-[11px] text-neutral-500 flex items-center justify-between font-mono">
        <div>
          Showing {sortedConfigs.length} of {configs.length} configurations
        </div>
        <div className="flex items-center gap-3">
          <span>Active Scope: {activeEnvironment}</span>
          <span>·</span>
          <span>Version: 31</span>
        </div>
      </div>
    </div>
  );
};
