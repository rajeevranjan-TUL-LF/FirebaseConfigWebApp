export type ConfigValueType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'null' 
  | 'json_object' 
  | 'json_array';

export type ConfigEnvironment = 'development' | 'staging' | 'production';

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  schema?: string;
}

export interface ConfigItem {
  id: string;
  key: string;
  folderId: string; // 'root' or specific folder ID
  type: ConfigValueType;
  description: string;
  defaultValue: any;
  // Live values per environment
  values: Record<ConfigEnvironment, any>;
  // Unsaved draft values per environment
  draftValues?: Partial<Record<ConfigEnvironment, any>>;
  isDraft?: boolean;
  tags: string[];
  validationRule?: ValidationRule;
  lastModifiedAt: string;
  lastModifiedBy: string;
  version: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  description?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: 'create' | 'update' | 'delete' | 'promote' | 'rollback' | 'import';
  key: string;
  folder: string;
  environment: ConfigEnvironment;
  previousValue: any;
  newValue: any;
  version: number;
  summary?: string;
}

export interface QueryParamItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface HeaderItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  isSecret?: boolean;
}

export interface ApiIntegrationConfig {
  sourceName: string;
  baseUrl: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  timeoutMs: number;
  enabled: boolean;
  envEndpoints: Record<ConfigEnvironment, string>;
  queryParams: QueryParamItem[];
  headers: HeaderItem[];
  requestBody?: string;
  auth: {
    type: 'none' | 'bearer' | 'apiKey' | 'basic';
    token?: string;
    apiKeyName?: string;
    apiKeyValue?: string;
    apiKeyIn?: 'header' | 'query';
    username?: string;
    password?: string;
  };
  lastSyncStatus: 'success' | 'failed' | 'never';
  lastSyncTimestamp?: string;
  lastSyncError?: string;
}

export interface ResponseMappingConfig {
  rootPath: string; // e.g. "$.data.feature_flags"
  handlingMode: 'nested_as_json' | 'flatten_keys';
  conflictResolution: 'merge' | 'replace';
  samplePayload: string;
}

export interface RuntimeRequestLog {
  id: string;
  timestamp: string;
  clientIp: string;
  platform: 'android' | 'ios' | 'web' | 'backend';
  sdkVersion: string;
  environment: ConfigEnvironment;
  servedVersion: number;
  status: number;
  latencyMs: number;
  cacheStatus: 'HIT' | 'MISS' | 'STALE';
}

export interface ApiToken {
  id: string;
  name: string;
  prefix: string;
  maskedToken: string;
  role: 'read-only' | 'read-write' | 'admin';
  environment: ConfigEnvironment | 'all';
  createdAt: string;
  lastUsedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Engineer' | 'Viewer';
  avatar: string;
  status: 'active' | 'invited';
}

export type ActiveView = 
  | 'overview' 
  | 'explorer' 
  | 'environments' 
  | 'api-integration' 
  | 'response-mapping' 
  | 'runtime-api' 
  | 'audit-history' 
  | 'access-management' 
  | 'settings';
