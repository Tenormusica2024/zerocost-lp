"use client";

import { useState } from "react";
import { useEffect } from "react";

interface ApiKeyData {
  zcKey: string | null;
  plan: string;
  email: string;
}

// API キー表示・コピーページ（クライアントコンポーネント）
export default function ApiKeysPage() {
  const [data, setData] = useState<ApiKeyData | null>(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/key-info")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    if (!data?.zcKey) return;
    navigator.clipboard.writeText(data.zcKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const maskedKey = data?.zcKey
    ? visible
      ? data.zcKey
      : `${data.zcKey.slice(0, 8)}${"•".repeat(32)}`
    : null;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
          API Keys
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Use this key as your Bearer token when calling the zerocost API
        </p>
      </div>

      {/* API キーカード */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Secret API key
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep this secret. Do not share or commit to version control.
            </p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700 font-medium">
            Active
          </span>
        </div>

        {loading ? (
          <div className="h-12 bg-slate-50 rounded-lg animate-pulse" />
        ) : maskedKey ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
              <code className="text-sm font-mono text-slate-700 flex-1 tracking-tight overflow-hidden">
                {maskedKey}
              </code>
            </div>

            {/* 表示トグル */}
            <button
              onClick={() => setVisible((v) => !v)}
              title={visible ? "Hide key" : "Show key"}
              className="p-2.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {visible ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>

            {/* コピー */}
            <button
              onClick={handleCopy}
              title="Copy to clipboard"
              className="p-2.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
              )}
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            No API key found. Please contact support.
          </p>
        )}
      </div>

      {/* 使い方 */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">
          How to use
        </h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-slate-500 text-xs mb-2">Python (openai SDK)</p>
            <pre className="bg-slate-900 text-slate-100 rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto">
{`from openai import OpenAI

client = OpenAI(
    api_key="YOUR_ZC_KEY",
    base_url="${process.env.NEXT_PUBLIC_ROUTER_BASE}/v1"
)

response = client.chat.completions.create(
    model="auto",
    messages=[{"role": "user", "content": "Hello!"}]
)`}
            </pre>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-2">curl</p>
            <pre className="bg-slate-900 text-slate-100 rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto">
{`curl -X POST ${process.env.NEXT_PUBLIC_ROUTER_BASE}/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_ZC_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"auto","messages":[{"role":"user","content":"Hello!"}]}'`}
            </pre>
          </div>
        </div>
      </div>

      {/* キー再発行（Coming soon） */}
      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Regenerate key
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Invalidates your current key and issues a new one
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
              Coming soon
            </span>
            <button
              disabled
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 bg-slate-50 border border-slate-100 cursor-not-allowed"
            >
              Regenerate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
