import React, { useState, useEffect } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { X, Folder as FolderIcon, Check } from 'lucide-react';

export const FolderModal: React.FC = () => {
  const {
    isFolderModalOpen,
    setIsFolderModalOpen,
    folderToEdit,
    setFolderToEdit,
    folders,
    createFolder,
    updateFolder,
  } = useConfig();

  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (folderToEdit) {
      setName(folderToEdit.name);
      setParentId(folderToEdit.parentId);
      setDescription(folderToEdit.description || '');
      setError('');
    } else {
      setName('');
      setParentId(null);
      setDescription('');
      setError('');
    }
  }, [folderToEdit, isFolderModalOpen]);

  if (!isFolderModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Folder name cannot be empty');
      return;
    }

    if (folderToEdit) {
      updateFolder(folderToEdit.id, cleanName, description);
    } else {
      createFolder(cleanName, parentId, description);
    }

    setIsFolderModalOpen(false);
    setFolderToEdit(null);
  };

  // Available parent folders (exclude self and children to prevent cycle)
  const availableParents = folders.filter(f => !folderToEdit || f.id !== folderToEdit.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-md rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <FolderIcon className="w-4 h-4 text-neutral-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {folderToEdit ? 'Edit Folder' : 'Create New Folder'}
            </h3>
          </div>
          <button
            onClick={() => {
              setIsFolderModalOpen(false);
              setFolderToEdit(null);
            }}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Folder Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Payments, Feature Flags, Mobile"
              value={name}
              onChange={e => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              autoFocus
            />
            {error && <p className="text-rose-600 dark:text-rose-400 text-[11px] mt-1">{error}</p>}
          </div>

          {!folderToEdit && (
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Parent Folder (Optional)
              </label>
              <select
                value={parentId || ''}
                onChange={e => setParentId(e.target.value || null)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              >
                <option value="">None (Top-level folder)</option>
                {availableParents.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of configurations kept in this folder..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => {
                setIsFolderModalOpen(false);
                setFolderToEdit(null);
              }}
              className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{folderToEdit ? 'Save Changes' : 'Create Folder'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
