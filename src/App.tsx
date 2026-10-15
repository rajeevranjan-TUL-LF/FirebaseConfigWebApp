/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewView } from './components/dashboard/OverviewView';
import { ConfigExplorer } from './components/explorer/ConfigExplorer';
import { EnvironmentsView } from './components/environments/EnvironmentsView';
import { ApiIntegrationView } from './components/api-integration/ApiIntegrationView';
import { ResponseMappingView } from './components/api-integration/ResponseMappingView';
import { RuntimeApiView } from './components/runtime-api/RuntimeApiView';
import { AuditHistoryView } from './components/history/AuditHistoryView';
import { AccessManagementView } from './components/access/AccessManagementView';
import { SettingsView } from './components/settings/SettingsView';
import { CommandPalette } from './components/modals/CommandPalette';
import { PublishDialog } from './components/modals/PublishDialog';
import { ToastContainer } from './components/common/ToastContainer';

const AppContent: React.FC = () => {
  const { activeView } = useConfig();

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView />;
      case 'explorer':
        return <ConfigExplorer />;
      case 'environments':
        return <EnvironmentsView />;
      case 'api-integration':
        return <ApiIntegrationView />;
      case 'response-mapping':
        return <ResponseMappingView />;
      case 'runtime-api':
        return <RuntimeApiView />;
      case 'audit-history':
        return <AuditHistoryView />;
      case 'access-management':
        return <AccessManagementView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ConfigExplorer />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 antialiased selection:bg-neutral-200 dark:selection:bg-neutral-800">
      {/* Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Viewport Content */}
        <main className="flex-1 overflow-hidden flex flex-col relative">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Interactive Overlays */}
      <CommandPalette />
      <PublishDialog />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
}
