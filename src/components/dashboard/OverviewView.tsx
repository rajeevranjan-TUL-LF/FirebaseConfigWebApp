import React from 'react';
import { useConfig } from '../../context/ConfigContext';
import { 
  Sliders, 
  FolderTree, 
  Layers, 
  Webhook, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Plus, 
  Upload, 
  FileCode2, 
  Radio, 
  Check, 
  Activity,
  History,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ConfigEnvironment } from '../../types/config';

export const OverviewView: React.FC = () => {
  const {
    configs,
    folders,
    pendingDraftCount,
    totalKeysCount,
    activeEnvironment,
    setActiveEnvironment,
    apiConfig,
    auditLogs,
    setActiveView,
    setIsAddModalOpen,
    setIsFolderModalOpen,
    setSelectedConfigId,
  } = useConfig();

  const recentlyModified = [...configs]
    .sort((a, b) => new Date(b.lastModifiedAt).getTime() - new Date(a.lastModifiedAt).getTime())
    .slice(0, 5);

  const recentAudits = auditLogs.slice(0, 5);

  const envs: ConfigEnvironment[] = ['development', 'staging', 'production'];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50/40 dark:bg-neutral-950">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Platform Overview
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Centralized remote configuration metrics, environment state, and external synchronization.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-md transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Key</span>
          </button>

          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-md transition-colors"
          >
            <FolderTree className="w-3.5 h-3.5 text-neutral-400" />
            <span>Create Folder</span>
          </button>

          <button
            onClick={() => setActiveView('api-integration')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-md transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-neutral-400" />
            <span>Test API</span>
          </button>

          <button
            onClick={() => setActiveView('runtime-api')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-md transition-colors"
          >
            <FileCode2 className="w-3.5 h-3.5 text-neutral-400" />
            <span>API Docs</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip - Strict Anti-Slop (No pill sandwich, clean tabular numbers) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
            Total Keys
          </p>
          <p className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-1 tabular-nums">
            {totalKeysCount}
          </p>
          <p className="text-[10px] text-neutral-400 mt-1">Across 6 types</p>
        </div>

        <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
            Folders
          </p>
          <p className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-1 tabular-nums">
            {folders.length}
          </p>
          <p className="text-[10px] text-neutral-400 mt-1">Hierarchical tree</p>
        </div>

        <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
            Pending Drafts
          </p>
          <p className={`text-xl font-bold font-mono mt-1 tabular-nums ${
            pendingDraftCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-900 dark:text-neutral-100'
          }`}>
            {pendingDraftCount}
          </p>
          <p className="text-[10px] text-neutral-400 mt-1">In {activeEnvironment}</p>
        </div>

        <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
            Source API Health
          </p>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>200 OK</span>
          </p>
          <p className="text-[10px] text-neutral-400 mt-1 font-mono">124ms latency</p>
        </div>

        <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
            Last Sync
          </p>
          <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mt-2">
            Just now
          </p>
          <p className="text-[10px] text-neutral-400 mt-1 font-mono">15 Oct 00:40 UTC</p>
        </div>

        <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
            Active Version
          </p>
          <p className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-1 tabular-nums">
            v31
          </p>
          <p className="text-[10px] text-neutral-400 mt-1">Runtime build</p>
        </div>
      </div>

      {/* Environments Sync Status Matrix */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Environment Synchronization Matrix
            </h2>
            <p className="text-xs text-neutral-500">
              Multi-tier configuration topology and live runtime release versions
            </p>
          </div>
          <button
            onClick={() => setActiveView('environments')}
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>Compare Environments</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {envs.map(env => {
            const isCurrent = activeEnvironment === env;
            const draftCount = configs.filter(c => {
              if (!c.draftValues) return false;
              const cur = c.values[env];
              const dft = c.draftValues[env];
              return dft !== undefined && JSON.stringify(cur) !== JSON.stringify(dft);
            }).length;

            return (
              <div 
                key={env}
                onClick={() => setActiveEnvironment(env)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  isCurrent
                    ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50/60 dark:bg-neutral-850 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="capitalize font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                    {env}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      SELECTED
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                  <div className="flex justify-between">
                    <span>Keys Configured:</span>
                    <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                      {totalKeysCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Drafts:</span>
                    <span className={`font-mono font-semibold tabular-nums ${
                      draftCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-900 dark:text-neutral-100'
                    }`}>
                      {draftCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Operational
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: Recently Modified & Configuration Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Modified Configurations */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Recently Modified Configurations
            </h2>
            <button
              onClick={() => setActiveView('explorer')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-neutral-200/80 dark:divide-neutral-800/80">
            {recentlyModified.map(item => (
              <div 
                key={item.id}
                onClick={() => {
                  setActiveView('explorer');
                  setSelectedConfigId(item.id);
                }}
                className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 px-2 rounded -mx-2 transition-colors text-xs"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {item.key}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                    {item.description}
                  </p>
                </div>

                <div className="text-right shrink-0 font-mono text-[11px] text-neutral-400 tabular-nums">
                  <div>{new Date(item.lastModifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="text-[10px] text-neutral-500">{item.lastModifiedBy}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Configuration Audit Activity */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Audit Activity Timeline
            </h2>
            <button
              onClick={() => setActiveView('audit-history')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Full Log
            </button>
          </div>

          <div className="space-y-3">
            {recentAudits.map(audit => (
              <div key={audit.id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {audit.userName}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono tabular-nums">
                      {new Date(audit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 mt-0.5">
                    {audit.summary || `${audit.action} on ${audit.key}`}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-400 font-mono">
                    <span>{audit.environment}</span>
                    <span>·</span>
                    <span>{audit.folder}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* External API Connection Status Card */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
            <Webhook className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                Source API: {apiConfig.sourceName}
              </h3>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-medium">
                CONNECTED
              </span>
            </div>
            <p className="text-xs font-mono text-neutral-500 mt-1">
              {apiConfig.baseUrl}{apiConfig.endpoint}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('api-integration')}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
          >
            Manage Integration
          </button>
          <button
            onClick={() => setActiveView('response-mapping')}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
          >
            Response Mapping
          </button>
        </div>
      </div>
    </div>
  );
};
