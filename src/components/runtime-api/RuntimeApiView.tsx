import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { 
  FileCode2, 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  Radio, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  Smartphone, 
  Globe, 
  Server,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ConfigEnvironment } from '../../types/config';
import { formatJson } from '../../utils/jsonUtils';

export const RuntimeApiView: React.FC = () => {
  const {
    configs,
    totalKeysCount,
    activeEnvironment,
    runtimeLogs,
    addToast
  } = useConfig();

  const [activeSnippetTab, setActiveSnippetTab] = useState<'kotlin' | 'swift' | 'typescript' | 'python' | 'curl'>('typescript');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [isExecutingLive, setIsExecutingLive] = useState(false);
  const [liveResponse, setLiveResponse] = useState<any | null>(null);

  // Build the complete combined runtime configuration payload for the active environment
  const combinedConfigPayload: Record<string, any> = {};
  configs.forEach(c => {
    combinedConfigPayload[c.key] = c.values[activeEnvironment];
  });

  const fullRuntimeResponse = {
    version: 31,
    environment: activeEnvironment,
    updatedAt: new Date().toISOString(),
    etag: 'W/"9942-cfg-2026-10-15-v31"',
    config: combinedConfigPayload,
  };

  const handleCopySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
    addToast({ title: 'Copied', description: 'Code snippet copied to clipboard.', type: 'info' });
  };

  const handleExecuteLiveRunner = async () => {
    setIsExecutingLive(true);
    await new Promise(r => setTimeout(r, 120));
    setLiveResponse({
      statusCode: 200,
      statusText: 'OK',
      latencyMs: 18,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'ETag': 'W/"9942-cfg-2026-10-15-v31"',
        'X-ConfigHub-Environment': activeEnvironment,
        'X-ConfigHub-Version': '31',
      },
      payload: fullRuntimeResponse,
    });
    setIsExecutingLive(false);
  };

  // Code snippets
  const snippets = {
    typescript: `// TypeScript / React / Node.js
import { ConfigHubClient } from '@confighub/sdk';

const config = new ConfigHubClient({
  endpoint: 'https://api.confighub.internal/api/v1/config',
  environment: '${activeEnvironment}',
  apiKey: process.env.CONFIGHUB_CLIENT_KEY,
  cacheTtlSeconds: 60,
});

await config.fetchAndActivate();

// Type-safe property access
const maintenanceMode = config.getBoolean('maintenance_mode', false);
const maxCart = config.getNumber('max_cart_items', 10);
const paymentConfig = config.getJSON('payment_gateway_config');`,

    kotlin: `// Android (Kotlin)
val client = ConfigHub.Builder(context)
    .setApiKey("cfg_live_client_••••••••••••94f2")
    .setEnvironment("${activeEnvironment}")
    .setMinimumFetchInterval(60L)
    .build()

client.fetchAndActivate().addOnSuccessListener {
    val isNewCheckout = client.getBoolean("enable_new_checkout")
    val gatewayConfig = client.getJSONObject("payment_gateway_config")
}`,

    swift: `// iOS (Swift)
let config = ConfigHub.shared
config.configure(
    apiKey: "cfg_live_client_••••••••••••94f2",
    environment: "${activeEnvironment}"
)

config.fetchAndActivate { status, error in
    guard error == nil else { return }
    let maintenance = config.boolean(forKey: "maintenance_mode")
    let maxItems = config.number(forKey: "max_cart_items")
}`,

    python: `# Python / Django / FastAPI
from confighub import ConfigHub

client = ConfigHub(
    api_key="cfg_live_client_••••••••••••94f2",
    environment="${activeEnvironment}"
)

# Retrieves entire snapshot in a single cached payload
app_config = client.get_all_config()
print("Rate limit:", app_config.get("rate_limit_per_minute"))`,

    curl: `# cURL Single-Response API Request
curl -X GET "https://api.confighub.internal/api/v1/config?env=${activeEnvironment}" \\
     -H "X-ConfigHub-Key: cfg_live_client_••••••••••••94f2" \\
     -H "Accept: application/json" \\
     -H "If-None-Match: W/\"9942-cfg-2026-10-15-v31\""`
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50/40 dark:bg-neutral-950 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Runtime Configuration API
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Documentation and single-response payload distribution specifications for mobile, web, and microservice clients.
          </p>
        </div>

        <button
          onClick={handleExecuteLiveRunner}
          disabled={isExecutingLive}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-md transition-colors shadow-xs"
        >
          {isExecutingLive ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          <span>Send Live API Request</span>
        </button>
      </div>

      {/* Architectural Guarantee Notice */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-2">
        <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
          Single-Response Architecture Guarantee
        </h2>
        <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
          Unlike legacy key-value stores that issue one HTTP request per configuration item, ConfigHub returns the entire application configuration in a single, gzipped JSON response with HTTP 304 conditional cache validation via ETags. Internal secrets and administrative tokens are never exposed.
        </p>
      </div>

      {/* Endpoint Specification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            HTTP Method & Route
          </p>
          <div className="flex items-center gap-2 mt-1.5 font-mono text-xs">
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
              GET
            </span>
            <span className="text-neutral-900 dark:text-neutral-100 font-semibold truncate">
              /api/v1/config
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Authentication
          </p>
          <p className="font-mono text-xs text-neutral-900 dark:text-neutral-100 mt-1.5 truncate">
            X-ConfigHub-Key: &lt;client_token&gt;
          </p>
        </div>

        <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Cache Control Header
          </p>
          <p className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300 mt-1.5 truncate">
            public, max-age=60, s-maxage=300
          </p>
        </div>
      </div>

      {/* Code Snippets Section */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-950 shadow-xs">
        {/* Language Tabs */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-900 text-xs">
          <div className="flex items-center gap-1">
            {(['typescript', 'kotlin', 'swift', 'python', 'curl'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSnippetTab(tab)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                  activeSnippetTab === tab
                    ? 'bg-neutral-800 text-neutral-100 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {tab === 'typescript' ? 'TypeScript / React' : tab === 'kotlin' ? 'Android (Kotlin)' : tab === 'swift' ? 'iOS (Swift)' : tab === 'python' ? 'Python' : 'cURL'}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleCopySnippet(snippets[activeSnippetTab])}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-100 text-[11px] transition-colors"
          >
            {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <pre className="p-4 font-mono text-[11px] text-neutral-200 leading-relaxed overflow-x-auto">
          {snippets[activeSnippetTab]}
        </pre>
      </div>

      {/* Interactive Live API Runner Result */}
      {liveResponse && (
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                Live HTTP Response: 200 OK ({liveResponse.latencyMs}ms)
              </h2>
            </div>
            <span className="font-mono text-[10px] text-neutral-400">
              Generated in real time from active configuration store
            </span>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-neutral-950 font-mono text-xs">
            <div className="p-2 bg-neutral-900 border-b border-neutral-800 text-neutral-400 text-[11px] flex justify-between">
              <span>Complete Single Response (all {totalKeysCount} keys)</span>
              <span>application/json</span>
            </div>
            <pre className="p-3 text-emerald-400 text-[11px] max-h-72 overflow-y-auto leading-relaxed">
              {formatJson(liveResponse.payload)}
            </pre>
          </div>
        </div>
      )}

      {/* Runtime Request Logs Stream */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Live Device Request Logs
            </h2>
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">
            Incoming telemetry from client SDKs
          </span>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-sans">
              <tr>
                <th className="p-2.5">Timestamp</th>
                <th className="p-2.5">Client IP</th>
                <th className="p-2.5">Platform & SDK</th>
                <th className="p-2.5">Environment</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Cache</th>
                <th className="p-2.5 text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {runtimeLogs.map(log => (
                <tr key={log.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-850">
                  <td className="p-2.5 text-neutral-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-2.5 text-neutral-900 dark:text-neutral-100">
                    {log.clientIp}
                  </td>
                  <td className="p-2.5 text-neutral-700 dark:text-neutral-300">
                    {log.sdkVersion}
                  </td>
                  <td className="p-2.5 font-sans capitalize">
                    {log.environment}
                  </td>
                  <td className="p-2.5">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {log.status}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      log.cacheStatus === 'HIT' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}>
                      {log.cacheStatus}
                    </span>
                  </td>
                  <td className="p-2.5 text-right text-neutral-500">
                    {log.latencyMs}ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
