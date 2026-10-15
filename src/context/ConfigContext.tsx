import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ConfigItem, 
  Folder, 
  AuditEntry, 
  ConfigEnvironment, 
  ActiveView, 
  ApiIntegrationConfig, 
  RuntimeRequestLog,
  ApiToken,
  TeamMember,
  ConfigValueType
} from '../types/config';
import { 
  initialConfigItems, 
  initialFolders, 
  initialAuditEntries, 
  initialApiIntegration, 
  initialRuntimeLogs,
  initialApiTokens,
  initialTeamMembers,
  sampleExternalApiPayload
} from '../data/initialConfig';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ConfigContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  activeEnvironment: ConfigEnvironment;
  setActiveEnvironment: (env: ConfigEnvironment) => void;
  configs: ConfigItem[];
  folders: Folder[];
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  selectedConfigId: string | null;
  setSelectedConfigId: (id: string | null) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  isFolderModalOpen: boolean;
  setIsFolderModalOpen: (open: boolean) => void;
  folderToEdit: Folder | null;
  setFolderToEdit: (folder: Folder | null) => void;
  isPublishDialogOpen: boolean;
  setIsPublishDialogOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  
  // Filters & search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  typeFilter: string;
  setTypeFilter: (t: string) => void;
  modifiedFilter: 'all' | 'draft' | 'published';
  setModifiedFilter: (m: 'all' | 'draft' | 'published') => void;
  sortBy: 'key' | 'type' | 'lastModified';
  setSortBy: (s: 'key' | 'type' | 'lastModified') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (o: 'asc' | 'desc') => void;
  
  // Selection
  selectedKeyIds: Set<string>;
  toggleSelectKey: (id: string) => void;
  selectAllKeys: (ids: string[]) => void;
  clearKeySelection: () => void;
  
  // Stats & counts
  pendingDraftCount: number;
  totalKeysCount: number;
  
  // Mutation operations
  saveDraftConfig: (id: string, newDraftValue: any, metadata?: Partial<ConfigItem>) => void;
  publishPendingChanges: (environment: ConfigEnvironment) => void;
  discardDrafts: (environment: ConfigEnvironment) => void;
  createConfigItem: (item: Omit<ConfigItem, 'id' | 'lastModifiedAt' | 'lastModifiedBy' | 'version'>) => boolean;
  updateConfigItem: (id: string, updates: Partial<ConfigItem>) => void;
  deleteConfigItem: (id: string) => void;
  duplicateConfigItem: (id: string) => void;
  bulkMoveToFolder: (keyIds: string[], folderId: string) => void;
  bulkDeleteKeys: (keyIds: string[]) => void;
  createFolder: (name: string, parentId: string | null, description?: string) => void;
  updateFolder: (id: string, name: string, description?: string) => void;
  deleteFolder: (id: string) => { success: boolean; error?: string };
  promoteEnvironment: (from: ConfigEnvironment, to: ConfigEnvironment) => void;
  rollbackToAuditVersion: (auditId: string) => void;
  importFromApiMapping: (mappedKeys: Record<string, any>, mode: 'merge' | 'replace') => void;
  bulkImportJson: (items: Array<{ key: string; value: any; type: ConfigValueType; folderId: string; description?: string }>, mode: 'skip' | 'overwrite') => { added: number; updated: number; skipped: number };
  
  // Integrations & tokens
  apiConfig: ApiIntegrationConfig;
  updateApiConfig: (updates: Partial<ApiIntegrationConfig>) => void;
  testApiConnection: (testMode?: 'success' | 'timeout' | 'auth_error' | 'invalid_json') => Promise<any>;
  apiTokens: ApiToken[];
  addApiToken: (name: string, role: 'read-only' | 'read-write' | 'admin', env: ConfigEnvironment | 'all') => void;
  revokeApiToken: (id: string) => void;
  teamMembers: TeamMember[];
  runtimeLogs: RuntimeRequestLog[];
  auditLogs: AuditEntry[];
  
  // Workspace info
  projectName: string;
  workspaceName: string;
  setProjectName: (name: string) => void;
  
  // Theme & Toast
  isDark: boolean;
  toggleDark: () => void;
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

const STORAGE_KEYS = {
  CONFIGS: 'confighub_configs_v1',
  FOLDERS: 'confighub_folders_v1',
  AUDIT: 'confighub_audit_v1',
  API_CFG: 'confighub_apicfg_v1',
  TOKENS: 'confighub_tokens_v1',
  ENV: 'confighub_env_v1',
  THEME: 'confighub_theme_v1',
};

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('explorer');
  const [activeEnvironment, setActiveEnvironment] = useState<ConfigEnvironment>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ENV);
    return (saved as ConfigEnvironment) || 'production';
  });
  
  const [configs, setConfigs] = useState<ConfigItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIGS);
      return saved ? JSON.parse(saved) : initialConfigItems;
    } catch {
      return initialConfigItems;
    }
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOLDERS);
      return saved ? JSON.parse(saved) : initialFolders;
    } catch {
      return initialFolders;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
      return saved ? JSON.parse(saved) : initialAuditEntries;
    } catch {
      return initialAuditEntries;
    }
  });

  const [apiConfig, setApiConfig] = useState<ApiIntegrationConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.API_CFG);
      return saved ? JSON.parse(saved) : initialApiIntegration;
    } catch {
      return initialApiIntegration;
    }
  });

  const [apiTokens, setApiTokens] = useState<ApiToken[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TOKENS);
      return saved ? JSON.parse(saved) : initialApiTokens;
    } catch {
      return initialApiTokens;
    }
  });

  const [teamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [runtimeLogs] = useState<RuntimeRequestLog[]>(initialRuntimeLogs);

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Filters & selection
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modifiedFilter, setModifiedFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [sortBy, setSortBy] = useState<'key' | 'type' | 'lastModified'>('key');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedKeyIds, setSelectedKeyIds] = useState<Set<string>>(new Set());

  // Workspace
  const [projectName, setProjectName] = useState('mobile-checkout');
  const [workspaceName] = useState('acme-corp');

  // Theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) === 'dark';
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIGS, JSON.stringify(configs));
    } catch {}
  }, [configs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
    } catch {}
  }, [folders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.API_CFG, JSON.stringify(apiConfig));
    } catch {}
  }, [apiConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ENV, activeEnvironment);
    } catch {}
  }, [activeEnvironment]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }, [isDark]);

  const toggleDark = () => setIsDark(prev => !prev);

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute counts
  const pendingDraftCount = configs.filter(c => {
    if (!c.draftValues) return false;
    const currentVal = c.values[activeEnvironment];
    const draftVal = c.draftValues[activeEnvironment];
    return draftVal !== undefined && JSON.stringify(currentVal) !== JSON.stringify(draftVal);
  }).length;

  const totalKeysCount = configs.length;

  // Selection helpers
  const toggleSelectKey = (id: string) => {
    setSelectedKeyIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllKeys = (ids: string[]) => {
    setSelectedKeyIds(new Set(ids));
  };

  const clearKeySelection = () => {
    setSelectedKeyIds(new Set());
  };

  // Save draft for specific environment
  const saveDraftConfig = (id: string, newDraftValue: any, metadata?: Partial<ConfigItem>) => {
    setConfigs(prev => prev.map(cfg => {
      if (cfg.id !== id) return cfg;
      const currentDrafts = cfg.draftValues || { ...cfg.values };
      const updatedDraftValues = {
        ...currentDrafts,
        [activeEnvironment]: newDraftValue,
      };
      return {
        ...cfg,
        ...metadata,
        draftValues: updatedDraftValues,
        isDraft: true,
        lastModifiedAt: new Date().toISOString(),
        lastModifiedBy: 'Alex Rivera (Draft)',
      };
    }));

    addToast({
      title: 'Draft saved',
      description: `Unsaved draft ready for ${activeEnvironment}. Publish when ready.`,
      type: 'info',
    });
  };

  // Publish all pending draft changes for an environment
  const publishPendingChanges = (environment: ConfigEnvironment) => {
    const updatedConfigs: ConfigItem[] = [];
    const newAuditEntries: AuditEntry[] = [];
    let publishCount = 0;

    for (const cfg of configs) {
      const draftVal = cfg.draftValues?.[environment];
      const currentVal = cfg.values[environment];

      if (draftVal !== undefined && JSON.stringify(draftVal) !== JSON.stringify(currentVal)) {
        publishCount++;
        const nextVersion = cfg.version + 1;
        const newValues = {
          ...cfg.values,
          [environment]: draftVal,
        };
        const nextDraftValues = { ...cfg.draftValues };
        delete nextDraftValues[environment];

        const hasRemainingDrafts = Object.keys(nextDraftValues).length > 0;

        updatedConfigs.push({
          ...cfg,
          values: newValues,
          draftValues: hasRemainingDrafts ? nextDraftValues : undefined,
          isDraft: hasRemainingDrafts,
          version: nextVersion,
          lastModifiedAt: new Date().toISOString(),
          lastModifiedBy: 'Alex Rivera',
        });

        // Add to audit trail
        const folderName = folders.find(f => f.id === cfg.folderId)?.name || 'General';
        newAuditEntries.unshift({
          id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          userId: 'user-1',
          userName: 'Alex Rivera',
          userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          action: 'update',
          key: cfg.key,
          folder: folderName,
          environment,
          previousValue: currentVal,
          newValue: draftVal,
          version: nextVersion,
          summary: `Published ${environment} configuration (v${nextVersion})`,
        });
      } else {
        updatedConfigs.push(cfg);
      }
    }

    if (publishCount > 0) {
      setConfigs(updatedConfigs);
      setAuditLogs(prev => [...newAuditEntries, ...prev]);
      addToast({
        title: 'Configuration published',
        description: `Successfully published ${publishCount} configuration ${publishCount === 1 ? 'key' : 'keys'} to ${environment}.`,
        type: 'success',
      });
    }
  };

  // Discard drafts
  const discardDrafts = (environment: ConfigEnvironment) => {
    setConfigs(prev => prev.map(cfg => {
      if (!cfg.draftValues || cfg.draftValues[environment] === undefined) return cfg;
      const nextDrafts = { ...cfg.draftValues };
      delete nextDrafts[environment];
      const hasRemaining = Object.keys(nextDrafts).length > 0;
      return {
        ...cfg,
        draftValues: hasRemaining ? nextDrafts : undefined,
        isDraft: hasRemaining,
      };
    }));

    addToast({
      title: 'Drafts discarded',
      description: `Reverted all pending drafts in ${environment} to live values.`,
      type: 'info',
    });
  };

  // Create single configuration key
  const createConfigItem = (item: Omit<ConfigItem, 'id' | 'lastModifiedAt' | 'lastModifiedBy' | 'version'>): boolean => {
    // Check key uniqueness
    const exists = configs.some(c => c.key.toLowerCase() === item.key.toLowerCase());
    if (exists) {
      addToast({
        title: 'Key already exists',
        description: `A configuration key named "${item.key}" already exists.`,
        type: 'error',
      });
      return false;
    }

    const newItem: ConfigItem = {
      ...item,
      id: `cfg-${Date.now()}`,
      version: 1,
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: 'Alex Rivera',
    };

    setConfigs(prev => [newItem, ...prev]);

    const folderName = folders.find(f => f.id === item.folderId)?.name || 'General';
    setAuditLogs(prev => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'user-1',
        userName: 'Alex Rivera',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        action: 'create',
        key: item.key,
        folder: folderName,
        environment: activeEnvironment,
        previousValue: null,
        newValue: item.values[activeEnvironment],
        version: 1,
        summary: `Created key "${item.key}" (${item.type})`,
      },
      ...prev,
    ]);

    addToast({
      title: 'Configuration created',
      description: `"${item.key}" was successfully created and active in ${activeEnvironment}.`,
      type: 'success',
    });

    return true;
  };

  const updateConfigItem = (id: string, updates: Partial<ConfigItem>) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, ...updates, lastModifiedAt: new Date().toISOString() } : c));
  };

  const deleteConfigItem = (id: string) => {
    const item = configs.find(c => c.id === id);
    if (!item) return;

    setConfigs(prev => prev.filter(c => c.id !== id));
    if (selectedConfigId === id) setSelectedConfigId(null);
    setSelectedKeyIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    const folderName = folders.find(f => f.id === item.folderId)?.name || 'General';
    setAuditLogs(prev => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'user-1',
        userName: 'Alex Rivera',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        action: 'delete',
        key: item.key,
        folder: folderName,
        environment: activeEnvironment,
        previousValue: item.values[activeEnvironment],
        newValue: null,
        version: item.version,
        summary: `Deleted key "${item.key}"`,
      },
      ...prev,
    ]);

    addToast({
      title: 'Configuration deleted',
      description: `Removed "${item.key}" from all environments.`,
      type: 'info',
    });
  };

  const duplicateConfigItem = (id: string) => {
    const item = configs.find(c => c.id === id);
    if (!item) return;

    let newKey = `${item.key}_copy`;
    let count = 1;
    while (configs.some(c => c.key === newKey)) {
      count++;
      newKey = `${item.key}_copy_${count}`;
    }

    const duplicated: ConfigItem = {
      ...item,
      id: `cfg-${Date.now()}`,
      key: newKey,
      version: 1,
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: 'Alex Rivera',
      draftValues: undefined,
      isDraft: false,
    };

    setConfigs(prev => [duplicated, ...prev]);
    addToast({
      title: 'Configuration duplicated',
      description: `Created clone "${newKey}".`,
      type: 'success',
    });
  };

  const bulkMoveToFolder = (keyIds: string[], folderId: string) => {
    setConfigs(prev => prev.map(c => keyIds.includes(c.id) ? { ...c, folderId } : c));
    const targetFolder = folders.find(f => f.id === folderId)?.name || 'Root';
    addToast({
      title: 'Configurations moved',
      description: `Moved ${keyIds.length} items to "${targetFolder}".`,
      type: 'success',
    });
    clearKeySelection();
  };

  const bulkDeleteKeys = (keyIds: string[]) => {
    setConfigs(prev => prev.filter(c => !keyIds.includes(c.id)));
    clearKeySelection();
    addToast({
      title: 'Configurations deleted',
      description: `Permanently removed ${keyIds.length} configuration keys.`,
      type: 'info',
    });
  };

  const createFolder = (name: string, parentId: string | null, description?: string) => {
    const id = `folder-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
    const newFolder: Folder = {
      id,
      name,
      parentId,
      description,
    };
    setFolders(prev => [...prev, newFolder]);
    addToast({
      title: 'Folder created',
      description: `Created folder "${name}".`,
      type: 'success',
    });
  };

  const updateFolder = (id: string, name: string, description?: string) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name, description } : f));
    addToast({
      title: 'Folder updated',
      description: `Renamed folder to "${name}".`,
      type: 'success',
    });
  };

  const deleteFolder = (id: string): { success: boolean; error?: string } => {
    // Check if folder has items
    const hasItems = configs.some(c => c.folderId === id);
    const hasChildren = folders.some(f => f.parentId === id);

    if (hasItems || hasChildren) {
      return {
        success: false,
        error: `Cannot delete folder: it contains ${hasItems ? 'configurations' : 'subfolders'}. Please reassign or delete them first.`,
      };
    }

    setFolders(prev => prev.filter(f => f.id !== id));
    if (selectedFolderId === id) setSelectedFolderId(null);

    addToast({
      title: 'Folder deleted',
      description: 'The empty folder has been removed.',
      type: 'info',
    });

    return { success: true };
  };

  // Environment Promotion
  const promoteEnvironment = (from: ConfigEnvironment, to: ConfigEnvironment) => {
    let changedCount = 0;
    const newAuditEntries: AuditEntry[] = [];

    const updated = configs.map(c => {
      const fromVal = c.values[from];
      const toVal = c.values[to];

      if (JSON.stringify(fromVal) !== JSON.stringify(toVal)) {
        changedCount++;
        const nextVersion = c.version + 1;
        const folderName = folders.find(f => f.id === c.folderId)?.name || 'General';

        newAuditEntries.push({
          id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          userId: 'user-1',
          userName: 'Alex Rivera',
          userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          action: 'promote',
          key: c.key,
          folder: folderName,
          environment: to,
          previousValue: toVal,
          newValue: fromVal,
          version: nextVersion,
          summary: `Promoted from ${from} to ${to}`,
        });

        return {
          ...c,
          values: {
            ...c.values,
            [to]: fromVal,
          },
          version: nextVersion,
          lastModifiedAt: new Date().toISOString(),
          lastModifiedBy: 'Alex Rivera (Promotion)',
        };
      }
      return c;
    });

    setConfigs(updated);
    setAuditLogs(prev => [...newAuditEntries, ...prev]);

    addToast({
      title: 'Environment promoted',
      description: `Promoted ${changedCount} configuration ${changedCount === 1 ? 'key' : 'keys'} from ${from} to ${to}.`,
      type: 'success',
    });
  };

  // Rollback to audit version
  const rollbackToAuditVersion = (auditId: string) => {
    const entry = auditLogs.find(a => a.id === auditId);
    if (!entry) return;

    const targetKey = configs.find(c => c.key === entry.key);
    if (!targetKey) {
      addToast({
        title: 'Key not found',
        description: `Cannot rollback: configuration key "${entry.key}" has been permanently deleted.`,
        type: 'error',
      });
      return;
    }

    const previousVal = entry.previousValue !== null ? entry.previousValue : entry.newValue;

    setConfigs(prev => prev.map(c => {
      if (c.key !== entry.key) return c;
      return {
        ...c,
        values: {
          ...c.values,
          [entry.environment]: previousVal,
        },
        version: c.version + 1,
        lastModifiedAt: new Date().toISOString(),
        lastModifiedBy: 'Alex Rivera (Rollback)',
      };
    }));

    setAuditLogs(prev => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'user-1',
        userName: 'Alex Rivera',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        action: 'rollback',
        key: entry.key,
        folder: entry.folder,
        environment: entry.environment,
        previousValue: targetKey.values[entry.environment],
        newValue: previousVal,
        version: targetKey.version + 1,
        summary: `Rolled back to previous state from audit #${entry.id.substring(0, 8)}`,
      },
      ...prev,
    ]);

    addToast({
      title: 'Rollback complete',
      description: `Reverted "${entry.key}" in ${entry.environment} to prior value.`,
      type: 'info',
    });
  };

  // Import from external API mapping
  const importFromApiMapping = (mappedKeys: Record<string, any>, mode: 'merge' | 'replace') => {
    const keys = Object.keys(mappedKeys);
    if (keys.length === 0) return;

    setConfigs(prev => {
      const existingMap = new Map(prev.map(c => [c.key, c]));
      let nextConfigs: ConfigItem[] = mode === 'replace' ? [] : [...prev];

      keys.forEach(k => {
        const val = mappedKeys[k];
        let valType: ConfigValueType = 'string';
        if (typeof val === 'boolean') valType = 'boolean';
        else if (typeof val === 'number') valType = 'number';
        else if (val === null) valType = 'null';
        else if (Array.isArray(val)) valType = 'json_array';
        else if (typeof val === 'object') valType = 'json_object';

        if (existingMap.has(k) && mode === 'merge') {
          // Update in draft
          nextConfigs = nextConfigs.map(c => {
            if (c.key !== k) return c;
            return {
              ...c,
              draftValues: {
                ...c.draftValues,
                [activeEnvironment]: val,
              },
              isDraft: true,
              lastModifiedAt: new Date().toISOString(),
            };
          });
        } else {
          // Create new
          nextConfigs.push({
            id: `cfg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            key: k,
            folderId: 'api-settings',
            type: valType,
            description: `Imported via API mapping from ${apiConfig.sourceName}`,
            defaultValue: val,
            values: {
              development: val,
              staging: val,
              production: val,
            },
            tags: ['api-import'],
            version: 1,
            lastModifiedAt: new Date().toISOString(),
            lastModifiedBy: 'API Sync Worker',
          });
        }
      });

      return nextConfigs;
    });

    addToast({
      title: 'API Mapping Imported',
      description: `Mapped and imported ${keys.length} keys (${mode === 'replace' ? 'replaced existing' : 'merged as drafts'}).`,
      type: 'success',
    });
  };

  // Bulk import from JSON
  const bulkImportJson = (
    items: Array<{ key: string; value: any; type: ConfigValueType; folderId: string; description?: string }>,
    mode: 'skip' | 'overwrite'
  ) => {
    let added = 0;
    let updated = 0;
    let skipped = 0;

    setConfigs(prev => {
      const map = new Map(prev.map(c => [c.key, c]));
      const list = [...prev];

      for (const item of items) {
        if (map.has(item.key)) {
          if (mode === 'skip') {
            skipped++;
          } else {
            // Overwrite
            updated++;
            const idx = list.findIndex(c => c.key === item.key);
            if (idx >= 0) {
              list[idx] = {
                ...list[idx],
                values: {
                  ...list[idx].values,
                  [activeEnvironment]: item.value,
                },
                type: item.type,
                folderId: item.folderId || list[idx].folderId,
                version: list[idx].version + 1,
                lastModifiedAt: new Date().toISOString(),
                lastModifiedBy: 'Alex Rivera (JSON Import)',
              };
            }
          }
        } else {
          // Create new
          added++;
          list.push({
            id: `cfg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            key: item.key,
            folderId: item.folderId || 'general',
            type: item.type,
            description: item.description || 'Imported via Bulk JSON Import',
            defaultValue: item.value,
            values: {
              development: item.value,
              staging: item.value,
              production: item.value,
            },
            tags: ['json-import'],
            version: 1,
            lastModifiedAt: new Date().toISOString(),
            lastModifiedBy: 'Alex Rivera (JSON Import)',
          });
        }
      }

      return list;
    });

    return { added, updated, skipped };
  };

  const updateApiConfig = (updates: Partial<ApiIntegrationConfig>) => {
    setApiConfig(prev => ({ ...prev, ...updates }));
  };

  // Interactive Live API Tester
  const testApiConnection = async (testMode: 'success' | 'timeout' | 'auth_error' | 'invalid_json' = 'success'): Promise<any> => {
    // Realistic simulation with artificial delay
    await new Promise(r => setTimeout(r, testMode === 'timeout' ? 3200 : 450));

    if (testMode === 'timeout') {
      updateApiConfig({
        lastSyncStatus: 'failed',
        lastSyncError: `Gateway Timeout: Request to ${apiConfig.baseUrl}${apiConfig.endpoint} exceeded ${apiConfig.timeoutMs}ms`,
        lastSyncTimestamp: new Date().toISOString(),
      });
      return {
        status: 504,
        statusText: 'Gateway Timeout',
        latencyMs: 3240,
        headers: { 'Content-Type': 'application/json', 'X-ConfigHub-Status': 'timeout' },
        body: { error: 'Gateway timeout while connecting to origin' },
        isValidJson: true,
      };
    }

    if (testMode === 'auth_error') {
      updateApiConfig({
        lastSyncStatus: 'failed',
        lastSyncError: 'Unauthorized (401): Missing or invalid Bearer authentication token',
        lastSyncTimestamp: new Date().toISOString(),
      });
      return {
        status: 401,
        statusText: 'Unauthorized',
        latencyMs: 142,
        headers: { 'WWW-Authenticate': 'Bearer realm="ConfigHub"', 'Content-Type': 'application/json' },
        body: { error: 'Invalid authentication credentials provided' },
        isValidJson: true,
      };
    }

    if (testMode === 'invalid_json') {
      updateApiConfig({
        lastSyncStatus: 'failed',
        lastSyncError: 'Parse Error: Origin server returned malformed HTML instead of JSON',
        lastSyncTimestamp: new Date().toISOString(),
      });
      return {
        status: 502,
        statusText: 'Bad Gateway',
        latencyMs: 210,
        headers: { 'Content-Type': 'text/html' },
        rawText: '<html><body>502 Bad Gateway: Origin unreachable</body></html>',
        isValidJson: false,
      };
    }

    // Success state
    updateApiConfig({
      lastSyncStatus: 'success',
      lastSyncError: undefined,
      lastSyncTimestamp: new Date().toISOString(),
    });

    return {
      status: 200,
      statusText: 'OK',
      latencyMs: 124,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
        'ETag': 'W/"9942-cfg-2026-10-15"',
        'X-Response-Time': '124ms',
      },
      body: sampleExternalApiPayload,
      isValidJson: true,
    };
  };

  const addApiToken = (name: string, role: 'read-only' | 'read-write' | 'admin', env: ConfigEnvironment | 'all') => {
    const rawId = Math.random().toString(36).substring(2, 8);
    const prefix = env === 'production' ? 'cfg_live' : env === 'staging' ? 'cfg_stage' : 'cfg_dev';
    const newToken: ApiToken = {
      id: `tok-${Date.now()}`,
      name,
      prefix,
      maskedToken: `${prefix}_${role}_••••••••••••${rawId}`,
      role,
      environment: env,
      createdAt: new Date().toISOString(),
      lastUsedAt: 'Never',
    };
    setApiTokens(prev => [newToken, ...prev]);
    addToast({
      title: 'API Token generated',
      description: `Created token "${name}" with ${role} permissions.`,
      type: 'success',
    });
  };

  const revokeApiToken = (id: string) => {
    setApiTokens(prev => prev.filter(t => t.id !== id));
    addToast({
      title: 'Token revoked',
      description: 'The API token has been permanently invalidated.',
      type: 'info',
    });
  };

  return (
    <ConfigContext.Provider
      value={{
        activeView,
        setActiveView,
        activeEnvironment,
        setActiveEnvironment,
        configs,
        folders,
        selectedFolderId,
        setSelectedFolderId,
        selectedConfigId,
        setSelectedConfigId,
        isAddModalOpen,
        setIsAddModalOpen,
        isFolderModalOpen,
        setIsFolderModalOpen,
        folderToEdit,
        setFolderToEdit,
        isPublishDialogOpen,
        setIsPublishDialogOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
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
        pendingDraftCount,
        totalKeysCount,
        saveDraftConfig,
        publishPendingChanges,
        discardDrafts,
        createConfigItem,
        updateConfigItem,
        deleteConfigItem,
        duplicateConfigItem,
        bulkMoveToFolder,
        bulkDeleteKeys,
        createFolder,
        updateFolder,
        deleteFolder,
        promoteEnvironment,
        rollbackToAuditVersion,
        importFromApiMapping,
        bulkImportJson,
        apiConfig,
        updateApiConfig,
        testApiConnection,
        apiTokens,
        addApiToken,
        revokeApiToken,
        teamMembers,
        runtimeLogs,
        auditLogs,
        projectName,
        workspaceName,
        setProjectName,
        isDark,
        toggleDark,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
