import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { 
  Webhook, 
  Play, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  KeyRound, 
  ShieldAlert, 
  Save, 
  RefreshCw,
  Code2,
  Lock
} from 'lucide-react';
import { ConfigEnvironment } from '../../types/config';
import { formatJson } from '../../utils/jsonUtils';

export const ApiIntegrationView: React.FC = () => {
  const {
    apiConfig,
    updateApiConfig,
    testApiConnection,
    activeEnvironment,
    addToast
  } = useConfig();

  // Local form state
  const [sourceName, setSourceName] = useState(apiConfig.sourceName);
  const [baseUrl, setBaseUrl] = useState(apiConfig.baseUrl);
  const [endpoint, setEndpoint] = useState(apiConfig.endpoint);
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'PATCH'>(apiConfig.method);
  const [timeoutMs, setTimeoutMs] = useState(apiConfig.timeoutMs);
  const [enabled, setEnabled] = useState(apiConfig.enabled);
  const [queryParams, setQueryParams] = useState(apiConfig.queryParams);
  const [headers, setHeaders] = useState(apiConfig.headers);
  const [revealedHeaderIds, setRevealedHeaderIds] = useState<Set<string>>(new Set());
  const [authType, setAuthType] = useState(apiConfig.auth.type);
  const [authToken, setAuthToken] = useState(apiConfig.auth.token || '');
  const [apiKeyName, setApiKeyName] = useState(apiConfig.auth.apiKeyName || 'X-API-Key');
  const [apiKeyValue, setApiKeyValue] = useState(apiConfig.auth.apiKeyValue || '');
  const [apiKeyIn, setApiKeyIn] = useState<'header' | 'query'>(apiConfig.auth.apiKeyIn || 'header');
  const [basicUser, setBasicUser] = useState(apiConfig.auth.username || '');
  const [basicPass, setBasicPass] = useState(apiConfig.auth.password || '');
  const [requestBody, setRequestBody] = useState(apiConfig.requestBody || '{\n  "version": "latest",\n  "include_beta": false\n}');

  // Test Runner state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [simulationMode, setSimulationMode] = useState<'success' | 'timeout' | 'auth_error' | 'invalid_json'>('success');

  const fullUrl = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const toggleRevealHeader = (id: string) => {
    setRevealedHeaderIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddQueryParam = () => {
    setQueryParams(prev => [
      ...prev,
      { id: `qp-${Date.now()}`, key: '', value: '', enabled: true }
    ]);
  };

  const handleRemoveQueryParam = (id: string) => {
    setQueryParams(prev => prev.filter(q => q.id !== id));
  };

  const handleAddHeader = () => {
    setHeaders(prev => [
      ...prev,
      { id: `hd-${Date.now()}`, key: '', value: '', enabled: true, isSecret: false }
    ]);
  };

  const handleRemoveHeader = (id: string) => {
    setHeaders(prev => prev.filter(h => h.id !== id));
  };

  const handleSaveSettings = () => {
    updateApiConfig({
      sourceName,
      baseUrl,
      endpoint,
      method,
      timeoutMs,
      enabled,
      queryParams,
      headers,
      requestBody,
      auth: {
        type: authType,
        token: authToken,
        apiKeyName,
        apiKeyValue,
        apiKeyIn,
        username: basicUser,
        password: basicPass,
      },
    });

    addToast({
      title: 'API Settings Saved',
      description: 'Configuration source settings updated successfully.',
      type: 'success',
    });
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testApiConnection(simulationMode);
      setTestResult(res);
      if (res.status === 200) {
        addToast({ title: 'Connection verified', description: `200 OK (${res.latencyMs}ms)`, type: 'success' });
      } else {
        addToast({ title: `Connection ${res.statusText}`, description: `HTTP ${res.status}`, type: 'error' });
      }
    } catch (err: any) {
      setTestResult({
        status: 500,
        statusText: 'Internal Error',
        latencyMs: 12,
        body: { error: err.message },
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50/40 dark:bg-neutral-950 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Source API Integration
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Configure external HTTP source endpoints from which ConfigHub synchronizes dynamic configuration data.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-md transition-colors shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Connection Settings Section */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
            Connection Settings
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-medium">Connection Enabled:</span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={e => setEnabled(e.target.checked)}
              className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Configuration Source Name
            </label>
            <input
              type="text"
              value={sourceName}
              onChange={e => setSourceName(e.target.value)}
              className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              HTTP Method
            </label>
            <select
              value={method}
              onChange={e => setMethod(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 focus:outline-none"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Request Timeout (ms)
            </label>
            <input
              type="number"
              value={timeoutMs}
              onChange={e => setTimeoutMs(parseInt(e.target.value, 10) || 1000)}
              className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Base URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              placeholder="https://api.internal.example.com"
              className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded font-mono text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Endpoint Path
            </label>
            <input
              type="text"
              value={endpoint}
              onChange={e => setEndpoint(e.target.value)}
              placeholder="/v2/config/export"
              className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded font-mono text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Generated URL Display */}
        <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 font-mono text-[11px] text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
          <div className="truncate">
            <span className="font-bold text-neutral-900 dark:text-neutral-100 mr-2">{method}</span>
            <span className="text-neutral-600 dark:text-neutral-400">{fullUrl}</span>
          </div>
        </div>
      </div>

      {/* Query Parameters Section */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Query Parameters
            </h2>
            <p className="text-[11px] text-neutral-500">
              Appended to external origin request
            </p>
          </div>
          <button
            onClick={handleAddQueryParam}
            className="flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Parameter</span>
          </button>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-sans">
              <tr>
                <th className="p-2 w-10">Active</th>
                <th className="p-2">Key</th>
                <th className="p-2">Value</th>
                <th className="p-2 w-12 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {queryParams.map((qp, index) => (
                <tr key={qp.id}>
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={qp.enabled}
                      onChange={e => {
                        const copy = [...queryParams];
                        copy[index].enabled = e.target.checked;
                        setQueryParams(copy);
                      }}
                      className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={qp.key}
                      onChange={e => {
                        const copy = [...queryParams];
                        copy[index].key = e.target.value;
                        setQueryParams(copy);
                      }}
                      placeholder="param_name"
                      className="w-full bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={qp.value}
                      onChange={e => {
                        const copy = [...queryParams];
                        copy[index].value = e.target.value;
                        setQueryParams(copy);
                      }}
                      placeholder="value"
                      className="w-full bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none"
                    />
                  </td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => handleRemoveQueryParam(qp.id)}
                      className="text-neutral-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* HTTP Headers & Secret Masking */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              HTTP Request Headers
            </h2>
            <p className="text-[11px] text-neutral-500">
              Headers transmitted with request. Sensitive credentials are encrypted and masked.
            </p>
          </div>
          <button
            onClick={handleAddHeader}
            className="flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Header</span>
          </button>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-sans">
              <tr>
                <th className="p-2 w-10">Active</th>
                <th className="p-2 w-48">Header Name</th>
                <th className="p-2">Value</th>
                <th className="p-2 w-20">Secret</th>
                <th className="p-2 w-12 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {headers.map((hd, index) => {
                const isRevealed = revealedHeaderIds.has(hd.id);
                return (
                  <tr key={hd.id}>
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={hd.enabled}
                        onChange={e => {
                          const copy = [...headers];
                          copy[index].enabled = e.target.checked;
                          setHeaders(copy);
                        }}
                        className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={hd.key}
                        onChange={e => {
                          const copy = [...headers];
                          copy[index].key = e.target.value;
                          setHeaders(copy);
                        }}
                        placeholder="Header-Name"
                        className="w-full bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1.5">
                        <input
                          type={hd.isSecret && !isRevealed ? 'password' : 'text'}
                          value={hd.value}
                          onChange={e => {
                            const copy = [...headers];
                            copy[index].value = e.target.value;
                            setHeaders(copy);
                          }}
                          placeholder="value"
                          className="w-full bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none"
                        />
                        {hd.isSecret && (
                          <button
                            type="button"
                            onClick={() => toggleRevealHeader(hd.id)}
                            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                            title={isRevealed ? 'Mask value' : 'Reveal secret'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-2 font-sans text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          const copy = [...headers];
                          copy[index].isSecret = !copy[index].isSecret;
                          setHeaders(copy);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          hd.isSecret ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'text-neutral-400'
                        }`}
                      >
                        {hd.isSecret ? 'Masked' : 'Plain'}
                      </button>
                    </td>
                    <td className="p-2 text-right">
                      <button
                        onClick={() => handleRemoveHeader(hd.id)}
                        className="text-neutral-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Authentication Settings */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
        <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
          Authentication Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {(['none', 'bearer', 'apiKey', 'basic'] as const).map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => setAuthType(mode)}
              className={`p-2.5 rounded-lg border text-left transition-colors ${
                authType === mode
                  ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-100/70 dark:bg-neutral-800 font-semibold'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
              }`}
            >
              <div className="capitalize">{mode === 'apiKey' ? 'API Key' : mode === 'bearer' ? 'Bearer Token' : mode === 'basic' ? 'Basic Auth' : 'No Auth'}</div>
            </button>
          ))}
        </div>

        {authType === 'bearer' && (
          <div className="pt-2">
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Bearer Token
            </label>
            <input
              type="password"
              value={authToken}
              onChange={e => setAuthToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded font-mono text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
          </div>
        )}

        {authType === 'apiKey' && (
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Header / Query Name
              </label>
              <input
                type="text"
                value={apiKeyName}
                onChange={e => setApiKeyName(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                API Key Value
              </label>
              <input
                type="password"
                value={apiKeyValue}
                onChange={e => setApiKeyValue(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Pass In
              </label>
              <select
                value={apiKeyIn}
                onChange={e => setApiKeyIn(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs"
              >
                <option value="header">Header</option>
                <option value="query">Query Parameter</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Test Connection Terminal & Live Simulation */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Live Connection Tester
            </h2>
            <p className="text-[11px] text-neutral-500">
              Verify connection, response time, SSL handshake, and JSON schema payload.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={simulationMode}
              onChange={e => setSimulationMode(e.target.value as any)}
              className="px-2.5 py-1.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs"
            >
              <option value="success">Simulation: 200 OK (Healthy)</option>
              <option value="timeout">Simulation: 504 Gateway Timeout</option>
              <option value="auth_error">Simulation: 401 Unauthorized</option>
              <option value="invalid_json">Simulation: 502 Bad Gateway (HTML)</option>
            </select>

            <button
              onClick={handleRunTest}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded transition-colors shadow-xs disabled:opacity-50"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isTesting ? 'Executing...' : 'Test Connection'}</span>
            </button>
          </div>
        </div>

        {/* Test Result Display */}
        {testResult && (
          <div className="space-y-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            {/* Status bar */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-100 dark:bg-neutral-850 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  testResult.status === 200 ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  HTTP {testResult.status} {testResult.statusText}
                </span>
              </div>
              <div className="flex items-center gap-3 text-neutral-500">
                <span>Latency: {testResult.latencyMs}ms</span>
                <span>·</span>
                <span>JSON Valid: {testResult.isValidJson ? 'Yes' : 'No'}</span>
              </div>
            </div>

            {/* Response Headers & Body */}
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-neutral-950 font-mono text-xs text-neutral-200">
              <div className="p-2 border-b border-neutral-800 bg-neutral-900 text-neutral-400 text-[11px] flex justify-between">
                <span>Response Body</span>
                <span>Content-Type: application/json</span>
              </div>
              <pre className="p-3 max-h-56 overflow-y-auto text-[11px] leading-relaxed text-emerald-400">
                {testResult.rawText || formatJson(testResult.body)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
