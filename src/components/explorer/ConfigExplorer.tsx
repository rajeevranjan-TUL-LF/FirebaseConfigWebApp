import React from 'react';
import { FolderTree } from './FolderTree';
import { ConfigTable } from './ConfigTable';
import { ConfigEditorDrawer } from './ConfigEditorDrawer';
import { AddConfigModal } from './AddConfigModal';
import { FolderModal } from './FolderModal';

export const ConfigExplorer: React.FC = () => {
  return (
    <div className="flex-1 flex h-full overflow-hidden relative">
      {/* Left Panel: Folder Explorer */}
      <FolderTree />

      {/* Main Panel: Key-Value Explorer Table */}
      <ConfigTable />

      {/* Side Editor Drawer */}
      <ConfigEditorDrawer />

      {/* Creation & Import Modal */}
      <AddConfigModal />

      {/* Folder Create/Edit Modal */}
      <FolderModal />
    </div>
  );
};
