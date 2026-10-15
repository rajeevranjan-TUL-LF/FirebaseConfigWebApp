import React, { useState, useEffect, useRef } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { 
  Search, 
  Sliders, 
  Folder as FolderIcon, 
  LayoutDashboard, 
  Layers, 
  Webhook, 
  FileCode2, 
  History, 
  ShieldCheck, 
  Settings,
  ArrowRight
} from 'lucide-react';
import { ActiveView } from '../../types/config';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    configs,
    folders,
    setSelectedConfigId,
    setSelectedFolderId,
    setActiveView,
  } = useConfig();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Filter items
  const cleanQ = query.trim().toLowerCase();

  const pagesList: Array<{ id: string; label: string; view: ActiveView; icon: any }> = [
    { id: 'p-overview', label: 'Go to Overview', view: 'overview', icon: LayoutDashboard },
    { id: 'p-explorer', label: 'Go to Configuration Explorer', view: 'explorer', icon: Sliders },
    { id: 'p-environments', label: 'Go to Environments Comparison', view: 'environments', icon: Layers },
    { id: 'p-api', label: 'Go to Source API Integration', view: 'api-integration', icon: Webhook },
    { id: 'p-runtime', label: 'Go to Runtime API Documentation', view: 'runtime-api', icon: FileCode2 },
    { id: 'p-history', label: 'Go to Change History & Diff', view: 'audit-history', icon: History },
    { id: 'p-access', label: 'Go to Access Management & API Tokens', view: 'access-management', icon: ShieldCheck },
    { id: 'p-settings', label: 'Go to Settings', view: 'settings', icon: Settings },
  ];
  const matchedPages = pagesList.filter(p => !cleanQ || p.label.toLowerCase().includes(cleanQ));

  const matchedConfigs = configs
    .filter(c => !cleanQ || c.key.toLowerCase().includes(cleanQ) || c.description.toLowerCase().includes(cleanQ))
    .slice(0, 6);

  const matchedFolders = folders
    .filter(f => !cleanQ || f.name.toLowerCase().includes(cleanQ))
    .slice(0, 4);

  const allItems = [
    ...matchedConfigs.map(c => ({ type: 'config' as const, data: c })),
    ...matchedFolders.map(f => ({ type: 'folder' as const, data: f })),
    ...matchedPages.map(p => ({ type: 'page' as const, data: p })),
  ];

  const handleSelect = (index: number) => {
    const item = allItems[index];
    if (!item) return;

    if (item.type === 'config') {
      setActiveView('explorer');
      setSelectedConfigId(item.data.id);
    } else if (item.type === 'folder') {
      setActiveView('explorer');
      setSelectedFolderId(item.data.id);
    } else if (item.type === 'page') {
      setActiveView(item.data.view);
    }

    setIsCommandPaletteOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (allItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allItems.length) % (allItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(selectedIndex);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsCommandPaletteOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a key, folder, or page command..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {allItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              No matching configurations, folders, or pages.
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;

              if (item.type === 'config') {
                return (
                  <button
                    key={`cfg-${item.data.id}`}
                    onClick={() => handleSelect(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                      isSelected
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Sliders className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="font-mono text-neutral-900 dark:text-neutral-100 truncate">
                        {item.data.key}
                      </span>
                      <span className="text-[11px] text-neutral-400 truncate">
                        {item.data.description}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase shrink-0 ml-2">
                      {item.data.type}
                    </span>
                  </button>
                );
              }

              if (item.type === 'folder') {
                return (
                  <button
                    key={`folder-${item.data.id}`}
                    onClick={() => handleSelect(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                      isSelected
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FolderIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="text-neutral-900 dark:text-neutral-100 truncate">
                        {item.data.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 shrink-0">Folder</span>
                  </button>
                );
              }

              const Icon = item.data.icon;
              return (
                <button
                  key={`page-${item.data.id}`}
                  onClick={() => handleSelect(idx)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="text-neutral-900 dark:text-neutral-100 truncate">
                      {item.data.label}
                    </span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-neutral-400 shrink-0" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-[11px] text-neutral-400 flex items-center justify-between">
          <span>Navigate with ↑ and ↓, Select with Enter</span>
          <span>ConfigHub Workspace</span>
        </div>
      </div>
    </div>
  );
};
