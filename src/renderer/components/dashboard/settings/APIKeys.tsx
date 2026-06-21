import React, { useState } from 'react';
import { api } from '../../../lib/api';

interface APIKeysProps {
  settings: Record<string, string>;
  onSave: () => void;
}

const APIKeys: React.FC<APIKeysProps> = ({ settings, onSave }) => {
  const [claudeKey, setClaudeKey] = useState(settings.claude_api_key || '');
  const [unsplashKey, setUnsplashKey] = useState(settings.unsplash_api_key || '');
  const [stripeKey, setStripeKey] = useState(settings.stripe_api_key || '');

  const handleSave = async () => {
    await api.put('/settings', {
      settings: {
        claude_api_key: claudeKey,
        unsplash_api_key: unsplashKey,
        stripe_api_key: stripeKey,
      },
    });
    onSave();
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.slice(0, 4) + '****' + key.slice(-4);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-heading font-semibold text-apex-text-primary">API Keys</h3>
      <p className="text-xs text-apex-text-muted">Keys are stored encrypted in the local database.</p>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-apex-text-secondary font-medium">Claude API Key (Anthropic)</label>
          <input
            type="password"
            value={claudeKey}
            onChange={(e) => setClaudeKey(e.target.value)}
            placeholder="sk-ant-..."
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none font-mono"
          />
          {settings.claude_api_key && (
            <p className="text-[10px] text-apex-text-muted mt-1">Current: {maskKey(settings.claude_api_key)}</p>
          )}
        </div>

        <div>
          <label className="text-xs text-apex-text-secondary font-medium">Unsplash API Key</label>
          <input
            type="password"
            value={unsplashKey}
            onChange={(e) => setUnsplashKey(e.target.value)}
            placeholder="Access Key..."
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none font-mono"
          />
          {settings.unsplash_api_key && (
            <p className="text-[10px] text-apex-text-muted mt-1">Current: {maskKey(settings.unsplash_api_key)}</p>
          )}
        </div>

        <div>
          <label className="text-xs text-apex-text-secondary font-medium">Stripe API Key</label>
          <input
            type="password"
            value={stripeKey}
            onChange={(e) => setStripeKey(e.target.value)}
            placeholder="sk_..."
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none font-mono"
          />
          {settings.stripe_api_key && (
            <p className="text-[10px] text-apex-text-muted mt-1">Current: {maskKey(settings.stripe_api_key)}</p>
          )}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-apex-accent text-white rounded-lg text-sm font-medium hover:bg-apex-accent-hover transition-colors"
      >
        Save API Keys
      </button>
    </div>
  );
};

export default APIKeys;
