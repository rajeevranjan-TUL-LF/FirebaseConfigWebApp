import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { 
  ShieldCheck, 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Lock, 
  Users,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';
import { ConfigEnvironment } from '../../types/config';

export const AccessManagementView: React.FC = () => {
  const {
    teamMembers,
    apiTokens,
    addApiToken,
    revokeApiToken,
    addToast
  } = useConfig();

  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [tokenRole, setTokenRole] = useState<'read-only' | 'read-write' | 'admin'>('read-only');
  const [tokenEnv, setTokenEnv] = useState<ConfigEnvironment | 'all'>('production');

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName.trim()) return;
    addApiToken(tokenName.trim(), tokenRole, tokenEnv);
    setIsTokenModalOpen(false);
    setTokenName('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50/40 dark:bg-neutral-950 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Access Management & Security
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Manage team roles, RBAC permissions, and runtime SDK authorization tokens.
          </p>
        </div>

        <button
          onClick={() => setIsTokenModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-md transition-colors shadow-xs"
        >
          <Key className="w-3.5 h-3.5" />
          <span>Generate API Token</span>
        </button>
      </div>

      {/* API Tokens Section */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Client & Microservice API Tokens
            </h2>
            <p className="text-[11px] text-neutral-500">
              Tokens used by Android, iOS, Web, and backend SDKs to query configurations.
            </p>
          </div>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-sans">
              <tr>
                <th className="p-3">Token Name</th>
                <th className="p-3">Masked Secret</th>
                <th className="p-3">Role</th>
                <th className="p-3">Environment Scope</th>
                <th className="p-3">Last Used</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {apiTokens.map(tok => (
                <tr key={tok.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-850">
                  <td className="p-3 font-semibold text-neutral-900 dark:text-neutral-100 font-sans">
                    {tok.name}
                  </td>
                  <td className="p-3 text-neutral-600 dark:text-neutral-300">
                    {tok.maskedToken}
                  </td>
                  <td className="p-3 font-sans">
                    <span className="capitalize px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {tok.role}
                    </span>
                  </td>
                  <td className="p-3 font-sans capitalize">
                    {tok.environment}
                  </td>
                  <td className="p-3 font-sans text-neutral-500">
                    {tok.lastUsedAt}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => revokeApiToken(tok.id)}
                      className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                      title="Revoke token"
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

      {/* Team Members & Roles Section */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
        <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
          Workspace Team Members
        </h2>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-sans">
              <tr>
                <th className="p-3">Member</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {teamMembers.map(mem => (
                <tr key={mem.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-850">
                  <td className="p-3 font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-bold">
                      {mem.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span>{mem.name}</span>
                  </td>
                  <td className="p-3 text-neutral-500 font-mono text-[11px]">
                    {mem.email}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {mem.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Token Modal */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-md rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              Generate New API Token
            </h3>

            <form onSubmit={handleCreateToken} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Token Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Android Release Client"
                  value={tokenName}
                  onChange={e => setTokenName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Permission Role
                </label>
                <select
                  value={tokenRole}
                  onChange={e => setTokenRole(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs"
                >
                  <option value="read-only">Read-Only (Client applications)</option>
                  <option value="read-write">Read-Write (CI/CD Pipelines)</option>
                  <option value="admin">Full Admin (All operations)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Environment Scope
                </label>
                <select
                  value={tokenEnv}
                  onChange={e => setTokenEnv(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs capitalize"
                >
                  <option value="production">Production Only</option>
                  <option value="staging">Staging Only</option>
                  <option value="development">Development Only</option>
                  <option value="all">All Environments</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsTokenModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 rounded"
                >
                  Create Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
