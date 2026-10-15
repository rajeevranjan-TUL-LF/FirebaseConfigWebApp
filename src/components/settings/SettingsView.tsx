import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { 
  Settings, 
  Save, 
  Download, 
  Bell, 
  Globe, 
  Shield, 
  HardDrive,
  Check
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    projectName,
    setProjectName,
    workspaceName,
    configs,
    folders,
    addToast
  } = useConfig();

  const [platformName, setPlatformName] = useState('ConfigHub');
  const [cacheTtl, setCacheTtl] = useState(60);
  const [enableSlackWebhooks, setEnableSlackWebhooks] = useState(true);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('https://hooks.slack.com/services/T00/B00/XXXX');
  const [notifyOnProdPublish, setNotifyOnProdPublish] = useState(true);

  const handleSave = () => {
    addToast({
      title: 'Settings saved',
      description: 'Workspace configuration and alert hooks updated.',
      type: 'success',
    });
  };

  const handleExportWorkspace = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      platform: platformName,
      project: projectName,
      workspace: workspaceName,
      folders,
      configs,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `confighub-${projectName}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);

    addToast({
      title: 'Backup generated',
      description: 'Full workspace configuration archive downloaded.',
      type: 'success',
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50/40 dark:bg-neutral-950 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Workspace & Platform Settings
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Global branding, caching parameters, change notification webhooks, and data backups.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-md transition-colors shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Settings</span>
        </button>
      </div>

      {/* General Branding Section */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
          General Configuration & Branding
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Platform Branding Name
            </label>
            <input
              type="text"
              value={platformName}
              onChange={e => setPlatformName(e.target.value)}
              className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Used in SDK telemetry and client dashboard headers
            </p>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Current Project Slug
            </label>
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Caching & Runtime Edge Distribution */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
          Edge Caching & Performance
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              CDN Edge Cache-Control TTL (seconds)
            </label>
            <input
              type="number"
              value={cacheTtl}
              onChange={e => setCacheTtl(parseInt(e.target.value, 10) || 60)}
              className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Controls <code className="font-mono">max-age</code> and <code className="font-mono">s-maxage</code> headers for client edge proxy caches.
            </p>
          </div>
        </div>
      </div>

      {/* Webhooks & Alerts */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
          Deployment Alerts & Webhooks
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
            <div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                Slack / Teams Webhook Notifications
              </span>
              <p className="text-[11px] text-neutral-500">
                Post changelog events automatically whenever configurations are published
              </p>
            </div>
            <input
              type="checkbox"
              checked={enableSlackWebhooks}
              onChange={e => setEnableSlackWebhooks(e.target.checked)}
              className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900"
            />
          </div>

          {enableSlackWebhooks && (
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Webhook URL
              </label>
              <input
                type="text"
                value={slackWebhookUrl}
                onChange={e => setSlackWebhookUrl(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
            Workspace Snapshot Backup
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Export all folders, configurations across all three environments, and metadata into a single JSON bundle.
          </p>
        </div>

        <button
          onClick={handleExportWorkspace}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Snapshot</span>
        </button>
      </div>
    </div>
  );
};
