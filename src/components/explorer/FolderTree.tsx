import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { 
  Folder as FolderIcon, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Search,
  Layers,
  FolderMinus,
  MoveRight
} from 'lucide-react';
import { Folder } from '../../types/config';

export const FolderTree: React.FC = () => {
  const {
    folders,
    configs,
    selectedFolderId,
    setSelectedFolderId,
    setIsFolderModalOpen,
    setFolderToEdit,
    deleteFolder,
    selectedKeyIds,
    bulkMoveToFolder,
    addToast
  } = useConfig();

  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(
    new Set(['app-settings', 'checkout', 'experiments'])
  );
  const [folderSearch, setFolderSearch] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deleteConfirmationFolder, setDeleteConfirmationFolder] = useState<Folder | null>(null);

  // Toggle expansion
  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolderIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Build tree
  const rootFolders = folders.filter(f => !f.parentId);
  const getSubFolders = (parentId: string) => folders.filter(f => f.parentId === parentId);

  // Key count calculation (including nested)
  const getKeyCount = (folderId: string): number => {
    const directCount = configs.filter(c => c.folderId === folderId).length;
    const subFolderIds = folders.filter(f => f.parentId === folderId).map(f => f.id);
    const subCount = subFolderIds.reduce((acc, subId) => acc + getKeyCount(subId), 0);
    return directCount + subCount;
  };

  const uncategorizedCount = configs.filter(c => !c.folderId || c.folderId === 'root').length;
  const totalCount = configs.length;

  // Filter folders by search
  const matchesSearch = (folder: Folder): boolean => {
    if (!folderSearch.trim()) return true;
    const q = folderSearch.toLowerCase();
    if (folder.name.toLowerCase().includes(q)) return true;
    const children = getSubFolders(folder.id);
    return children.some(matchesSearch);
  };

  const handleDeleteClick = (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    const count = getKeyCount(folder.id);
    if (count > 0 || getSubFolders(folder.id).length > 0) {
      setDeleteConfirmationFolder(folder);
    } else {
      deleteFolder(folder.id);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmationFolder) {
      const res = deleteFolder(deleteConfirmationFolder.id);
      if (!res.success && res.error) {
        addToast({
          title: 'Cannot delete folder',
          description: res.error,
          type: 'error',
        });
      }
      setDeleteConfirmationFolder(null);
    }
  };

  // Render a folder node
  const renderFolderNode = (folder: Folder, level = 0) => {
    if (!matchesSearch(folder)) return null;

    const subFolders = getSubFolders(folder.id);
    const hasChildren = subFolders.length > 0;
    const isExpanded = expandedFolderIds.has(folder.id) || !!folderSearch.trim();
    const isSelected = selectedFolderId === folder.id;
    const keyCount = getKeyCount(folder.id);

    return (
      <div key={folder.id} className="select-none">
        <div
          onClick={() => setSelectedFolderId(folder.id)}
          onDragOver={e => {
            if (selectedKeyIds.size > 0) {
              e.preventDefault();
            }
          }}
          onDrop={e => {
            e.preventDefault();
            if (selectedKeyIds.size > 0) {
              bulkMoveToFolder(Array.from(selectedKeyIds), folder.id);
            }
          }}
          className={`group relative flex items-center justify-between py-1.5 px-2 rounded-md text-xs cursor-pointer transition-colors ${
            isSelected
              ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
          style={{ paddingLeft: `${8 + level * 14}px` }}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {hasChildren ? (
              <button
                onClick={e => toggleExpand(folder.id, e)}
                className="p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            ) : (
              <span className="w-4" />
            )}

            {isExpanded && hasChildren ? (
              <FolderOpen className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 shrink-0" />
            ) : (
              <FolderIcon className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
            )}

            <span className="truncate">{folder.name}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            {/* Quick move target if keys are selected */}
            {selectedKeyIds.size > 0 && !isSelected && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  bulkMoveToFolder(Array.from(selectedKeyIds), folder.id);
                }}
                className="hidden group-hover:flex items-center gap-1 px-1.5 py-0.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded text-[10px] font-medium"
                title={`Move ${selectedKeyIds.size} selected keys into ${folder.name}`}
              >
                <MoveRight className="w-2.5 h-2.5" />
                Move
              </button>
            )}

            <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 tabular-nums">
              {keyCount}
            </span>

            {/* Folder Actions Menu */}
            <div className="relative">
              <button
                onClick={e => {
                  e.stopPropagation();
                  setActiveMenuId(activeMenuId === folder.id ? null : folder.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded transition-opacity"
              >
                <MoreVertical className="w-3 h-3" />
              </button>

              {activeMenuId === folder.id && (
                <div 
                  className="absolute right-0 top-full mt-1 w-36 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl z-30 p-1 text-xs"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setFolderToEdit(folder);
                      setIsFolderModalOpen(true);
                      setActiveMenuId(null);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  >
                    <Edit2 className="w-3 h-3 text-neutral-400" />
                    Rename
                  </button>
                  <button
                    onClick={e => handleDeleteClick(folder, e)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subfolders */}
        {hasChildren && isExpanded && (
          <div className="space-y-0.5">
            {subFolders.map(child => renderFolderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-60 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex flex-col h-full select-none">
      {/* Top Header of Explorer */}
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Folders
        </span>
        <button
          onClick={() => {
            setFolderToEdit(null);
            setIsFolderModalOpen(true);
          }}
          className="flex items-center gap-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-1.5 py-0.5 rounded transition-colors"
          title="Create new folder"
        >
          <Plus className="w-3 h-3" />
          <span>New</span>
        </button>
      </div>

      {/* Search Folders */}
      <div className="px-3 py-2 border-b border-neutral-200/70 dark:border-neutral-800/70">
        <div className="flex items-center gap-2 px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-xs">
          <Search className="w-3 h-3 text-neutral-400 shrink-0" />
          <input
            type="text"
            placeholder="Filter folders..."
            value={folderSearch}
            onChange={e => setFolderSearch(e.target.value)}
            className="w-full bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-[11px] focus:outline-none"
          />
        </div>
      </div>

      {/* Folder Nodes List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {/* All Configurations Option */}
        <div
          onClick={() => setSelectedFolderId(null)}
          className={`flex items-center justify-between py-1.5 px-2 rounded-md text-xs cursor-pointer transition-colors ${
            selectedFolderId === null
              ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-neutral-500" />
            <span>All Configurations</span>
          </div>
          <span className="font-mono text-[10px] text-neutral-400 tabular-nums">
            {totalCount}
          </span>
        </div>

        {/* Tree Root Folders */}
        {rootFolders.map(folder => renderFolderNode(folder, 0))}

        {/* Unassigned / Root */}
        {uncategorizedCount > 0 && (
          <div
            onClick={() => setSelectedFolderId('root')}
            className={`flex items-center justify-between py-1.5 px-2 rounded-md text-xs cursor-pointer transition-colors ${
              selectedFolderId === 'root'
                ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <FolderMinus className="w-3.5 h-3.5 text-neutral-400" />
              <span className="italic text-neutral-500">Unassigned</span>
            </div>
            <span className="font-mono text-[10px] text-neutral-400 tabular-nums">
              {uncategorizedCount}
            </span>
          </div>
        )}
      </div>

      {/* Delete Folder Warning Modal */}
      {deleteConfirmationFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div 
            className="w-full max-w-sm rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 shadow-2xl space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Cannot delete non-empty folder
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Folder <strong className="text-neutral-900 dark:text-neutral-100">"{deleteConfirmationFolder.name}"</strong> contains {getKeyCount(deleteConfirmationFolder.id)} keys or nested folders. Please move or reassign them before deleting.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmationFolder(null)}
                className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
