import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { 
  LayoutDashboard, 
  Sliders, 
  FolderTree, 
  Layers, 
  Webhook, 
  Terminal, 
  History, 
  ShieldCheck, 
  Settings, 
  ChevronDown, 
  ChevronsUpDown,
  Sun,
  Moon,
  Sparkles,
  GitBranch,
  Search,
  CheckCircle2,
  FileCode2,
  Boxes
} from 'lucide-react';
import { ActiveView, ConfigEnvironment } from '../../types/config';

export const Sidebar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    activeEnvironment, 
    setActiveEnvironment, 
    pendingDraftCount,
    totalKeysCount,
    projectName,
    workspaceName,
    isDark,
    toggleDark,
    setSelectedFolderId,
    setModifiedFilter
  } = useConfig();

  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isConfigSubMenuOpen, setIsConfigSubMenuOpen] = useState(true);
  const [isEnvSubMenuOpen, setIsEnvSubMenuOpen] = useState(true);
  const [isApiSubMenuOpen, setIsApiSubMenuOpen] = useState(true);
  const [isRuntimeSubMenuOpen, setIsRuntimeSubMenuOpen] = useState(true);

  const projects = [
    { id: 'mobile-checkout', name: 'mobile-checkout', label: 'Mobile & Checkout Suite' },
    { id: 'web-storefront', name: 'web-storefront', label: 'E-Commerce Web Portal' },
    { id: 'internal-ops', name: 'internal-ops', label: 'Backoffice Tooling' },
  ];

  const handleNav = (view: ActiveView) => {
    setActiveView(view);
  };

  return (
    <aside className="w-64 shrink-0 flex flex-col h-screen border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/80 backdrop-blur-sm select-none">
      {/* Workspace & Project Selector */}
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 relative">
        <button
          onClick={() => setIsWorkspaceMenuOpen(prev => !prev)}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors text-left shadow-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-900 font-bold text-xs shrink-0 tracking-wider">
              C
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider truncate">
                {workspaceName}
              </p>
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {projectName}
              </p>
            </div>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-1.5" />
        </button>

        {/* Dropdown Menu */}
        {isWorkspaceMenuOpen && (
          <div className="absolute top-full left-3 right-3 mt-1.5 p-1 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl z-50">
            <div className="px-2 py-1.5 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Switch Project
            </div>
            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setIsWorkspaceMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left transition-colors ${
                  p.id === projectName 
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium' 
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                }`}
              >
                <div className="truncate">
                  <span className="font-mono text-[11px]">{p.name}</span>
                  <p className="text-[10px] text-neutral-400 truncate">{p.label}</p>
                </div>
                {p.id === projectName && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs font-medium">
        {/* Section 1: Core Navigation */}
        <div className="space-y-0.5">
          <button
            onClick={() => handleNav('overview')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors ${
              activeView === 'overview'
                ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="truncate">Overview</span>
          </button>
        </div>

        {/* Section 2: Configurations */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase">
            <span>Configurations</span>
            <button
              onClick={() => setIsConfigSubMenuOpen(prev => !prev)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${isConfigSubMenuOpen ? '' : '-rotate-90'}`} />
            </button>
          </div>

          {isConfigSubMenuOpen && (
            <div className="space-y-0.5 pl-1">
              <button
                onClick={() => {
                  setSelectedFolderId(null);
                  setModifiedFilter('all');
                  handleNav('explorer');
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors ${
                  activeView === 'explorer'
                    ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sliders className="w-4 h-4 shrink-0" />
                  <span className="truncate">All Configurations</span>
                </div>
                <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 tabular-nums">
                  {totalKeysCount}
                </span>
              </button>

              <button
                onClick={() => {
                  handleNav('explorer');
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-900 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FolderTree className="w-4 h-4 shrink-0" />
                  <span className="truncate">Folders</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setModifiedFilter('draft');
                  handleNav('explorer');
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-900 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span className="truncate">Recently Modified</span>
                </div>
                {pendingDraftCount > 0 && (
                  <span className="text-[10px] font-mono font-medium text-amber-600 dark:text-amber-400 tabular-nums">
                    {pendingDraftCount} draft
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Section 3: Environments */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase">
            <span>Environments</span>
            <button
              onClick={() => setIsEnvSubMenuOpen(prev => !prev)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${isEnvSubMenuOpen ? '' : '-rotate-90'}`} />
            </button>
          </div>

          {isEnvSubMenuOpen && (
            <div className="space-y-0.5 pl-1">
              {(['development', 'staging', 'production'] as ConfigEnvironment[]).map(env => {
                const isActive = activeEnvironment === env;
                return (
                  <button
                    key={env}
                    onClick={() => {
                      setActiveEnvironment(env);
                      handleNav('environments');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors ${
                      activeView === 'environments' && isActive
                        ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Layers className="w-4 h-4 shrink-0" />
                      <span className="capitalize truncate">{env}</span>
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                        active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 4: API Integration */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase">
            <span>API Integration</span>
            <button
              onClick={() => setIsApiSubMenuOpen(prev => !prev)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${isApiSubMenuOpen ? '' : '-rotate-90'}`} />
            </button>
          </div>

          {isApiSubMenuOpen && (
            <div className="space-y-0.5 pl-1">
              <button
                onClick={() => handleNav('api-integration')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors ${
                  activeView === 'api-integration'
                    ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-900'
                }`}
              >
                <Webhook className="w-4 h-4 shrink-0" />
                <span className="truncate">Source API</span>
              </button>

              <button
                onClick={() => handleNav('response-mapping')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors ${
                  activeView === 'response-mapping'
                    ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-900'
                }`}
              >
                <Boxes className="w-4 h-4 shrink-0" />
                <span className="truncate">Response Mapping</span>
              </button>
            </div>
          )}
        </div>

        {/* Section 5: Runtime API */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase">
            <span>Runtime API</span>
            <button
              onClick={() => setIsRuntimeSubMenuOpen(prev => !prev)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${isRuntimeSubMenuOpen ? '' : '-rotate-90'}`} />
            </button>
          </div>

          {isRuntimeSubMenuOpen && (
            <div className="space-y-0.5 pl-1">
              <button
                onClick={() => handleNav('runtime-api')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors ${
                  activeView === 'runtime-api'
                    ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-900'
                }`}
              >
                <FileCode2 className="w-4 h-4 shrink-0" />
                <span className="truncate">API Documentation</span>
              </button>
            </div>
          )}
        </div>

        {/* Section 6: Governance */}
        <div className="space-y-0.5 pt-2 border-t border-neutral-200/70 dark:border-neutral-800/70">
          <button
            onClick={() => handleNav('audit-history')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors ${
              activeView === 'audit-history'
                ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-900'
            }`}
          >
            <History className="w-4 h-4 shrink-0" />
            <span className="truncate">Change History</span>
          </button>

          <button
            onClick={() => handleNav('access-management')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors ${
              activeView === 'access-management'
                ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">Access Management</span>
          </button>

          <button
            onClick={() => handleNav('settings')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors ${
              activeView === 'settings'
                ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-900'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span className="truncate">Settings</span>
          </button>
        </div>
      </div>

      {/* User Footer Profile & Theme Toggle */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-900/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center overflow-hidden shrink-0">
            <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-200">AR</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              Alex Rivera
            </p>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">
              Staff DevOps Engineer
            </p>
          </div>
        </div>

        <button
          onClick={toggleDark}
          className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
        </button>
      </div>
    </aside>
  );
};
