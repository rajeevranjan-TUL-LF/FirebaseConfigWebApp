import React from 'react';
import { useConfig } from '../../context/ConfigContext';
import { 
  Search, 
  UploadCloud, 
  HelpCircle, 
  Bell, 
  Check, 
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { ConfigEnvironment } from '../../types/config';

export const Header: React.FC = () => {
  const {
    workspaceName,
    projectName,
    activeEnvironment,
    setActiveEnvironment,
    pendingDraftCount,
    setIsPublishDialogOpen,
    setIsCommandPaletteOpen,
    activeView,
    setActiveView
  } = useConfig();

  const envColors: Record<ConfigEnvironment, { dot: string; border: string; text: string }> = {
    development: {
      dot: 'bg-neutral-400',
      border: 'border-neutral-300 dark:border-neutral-700',
      text: 'text-neutral-700 dark:text-neutral-300',
    },
    staging: {
      dot: 'bg-indigo-500',
      border: 'border-indigo-300 dark:border-indigo-800',
      text: 'text-indigo-700 dark:text-indigo-300',
    },
    production: {
      dot: 'bg-emerald-500',
      border: 'border-emerald-300 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
    },
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'overview': return 'Overview';
      case 'explorer': return 'Configuration Explorer';
      case 'environments': return 'Environments';
      case 'api-integration': return 'Source API Integration';
      case 'response-mapping': return 'Response Mapping';
      case 'runtime-api': return 'Runtime API';
      case 'audit-history': return 'Change History';
      case 'access-management': return 'Access Management';
      case 'settings': return 'Settings';
      default: return 'Configurations';
    }
  };

  return (
    <header className="h-12 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm px-4 flex items-center justify-between gap-4 z-20 shrink-0">
      {/* Breadcrumb trail */}
      <div className="flex items-center gap-1.5 text-xs min-w-0">
        <span className="font-mono text-neutral-400 dark:text-neutral-500">{workspaceName}</span>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <span className="font-mono font-medium text-neutral-600 dark:text-neutral-300">{projectName}</span>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{getViewTitle()}</span>
      </div>

      {/* Center & Right Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Global Search Button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60 rounded-md transition-colors"
          title="Search configurations, folders, or pages (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search keys...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 dark:text-neutral-500 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-700">
            ⌘K
          </kbd>
        </button>

        {/* Environment Selector */}
        <div className="flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/60 text-xs">
          {(['development', 'staging', 'production'] as ConfigEnvironment[]).map(env => {
            const isSelected = activeEnvironment === env;
            return (
              <button
                key={env}
                onClick={() => setActiveEnvironment(env)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors font-medium whitespace-nowrap ${
                  isSelected
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {env === 'development' ? 'Dev' : env === 'staging' ? 'Stage' : 'Prod'}
              </button>
            );
          })}
        </div>

        {/* Sync / Draft Status */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          {pendingDraftCount > 0 ? (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="font-mono text-xs">{pendingDraftCount}</span> draft {pendingDraftCount === 1 ? 'change' : 'changes'}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 text-xs">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Synced
            </span>
          )}
        </div>

        {/* Publish Changes Action */}
        {pendingDraftCount > 0 && (
          <button
            onClick={() => setIsPublishDialogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-md transition-colors shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Publish</span>
            <span className="px-1 text-[10px] bg-neutral-700 dark:bg-neutral-300 rounded font-mono">
              {pendingDraftCount}
            </span>
          </button>
        )}

        {/* Runtime API Quick Link */}
        <button
          onClick={() => setActiveView('runtime-api')}
          className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
          title="Runtime API Documentation & SDKs"
          aria-label="API Documentation"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
