// Uncomment this line to use CSS modules
import styles from './app.module.css';

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import React from 'react';

// Extracted client
import { apiClient, type HealthOk, type HealthErr } from '../shared/api-client';

//
// Future imports (Phase1 libs):
// import { apiClient } from '@shared/api-client';
// import { HealthSchema } from '@shared/zod-schemas';
//

/**
 * TODO(Phase 1 - silent):
 * - Replace temporary Legacy Admin link with a React Admin route and component.
 * - Extract fetchHealth and types into a shared API client lib (libs/shared/shared-api-client) using VITE_API_URL.
 * - Add Zod schema validation for /health, guard parsing errors gracefully.
 * - Migrate remaining static content into React components and routes.
 * - Add Playwright smoke test to verify header links and health badge rendering.
 * - After migration, archive legacy static pages into docs/_archive/static with a mapping README.
 * - Keep this note until Phase 1 completes, then remove.
 */

const HealthStatus: React.FC<{ value: string }> = ({ value }) => {
  const normalized = value.toLowerCase();
  if (normalized.includes('checking')) {
    return (
      <span className="inline-block text-gray-600 text-sm" aria-live="polite" aria-busy="true">
        checking...
      </span>
    );
  }
  const isErr = normalized.startsWith('error') || normalized.includes('fail');
  const color = isErr ? 'text-red-600 bg-red-50 border-red-200' : 'text-green-700 bg-green-50 border-green-200';
  return (
    <span className={`inline-block rounded px-2 py-1 text-sm border ${color}`} aria-live="polite">
      {value}
    </span>
  );
};

export function App() {
  const Home = () => {
    const [health, setHealth] = React.useState<string>('checking...');
    React.useEffect(() => {
      apiClient
        .fetchHealth()
        .then((res: HealthOk | HealthErr) => {
          if (typeof (res as HealthOk).status === 'string') {
            setHealth(((res as HealthOk).status as string) || 'ok');
            return;
          }
          if (typeof (res as HealthErr).error === 'string') {
            setHealth(`error: ${(res as HealthErr).error}`);
            return;
          }
          setHealth('unknown');
        })
        .catch((e: unknown) => {
          const msg = e && typeof e === 'object' && 'message' in e ? (e as any).message : 'failed';
          setHealth(`error: ${msg}`);
        });
    }, []);
    return (
      <div className="space-y-10">
        {/* Hero */}
        <section className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h1 className="text-3xl font-bold tracking-tight">AGENT Console</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Unified AI workspace for development, trading, legal, research, and data engineering.
          </p>
          <div className="mt-4 flex items-center gap-3 text-sm">
            <span className="text-gray-600 dark:text-gray-300">Backend health:</span>
            <HealthStatus value={health} />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            API base: {apiClient.baseUrl || '(same-origin)'}
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              to="/admin"
              className="inline-flex items-center px-3 py-1.5 rounded bg-gray-900 text-white hover:bg-gray-800"
              title="Go to Admin"
            >
              Open Admin
            </Link>
            <a
              href="/health"
              className="inline-flex items-center px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
              title="Open /health endpoint"
            >
              View /health
            </a>
          </div>
        </section>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-4">
          <article className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <h2 className="font-semibold">Developer</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Code review, debugging, and architectural guidance.
            </p>
          </article>
          <article className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <h2 className="font-semibold">Trader</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Market analysis, risk management, and strategy assistance.
            </p>
          </article>
          <article className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <h2 className="font-semibold">Lawyer</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Contract review, compliance, and IP guidance.
            </p>
          </article>
        </section>

        {/* Quick Links */}
        <section className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="font-semibold">Quick links</h3>
          <ul className="mt-2 list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>
              <a className="hover:underline" href="/health">Backend health endpoint</a>
            </li>
            <li>
              <Link className="text-blue-700 hover:underline" to="/admin">Admin page</Link>
            </li>
          </ul>
        </section>
      </div>
    );
  };

  const Admin: React.FC = () => (
    <section aria-labelledby="admin-title" className="space-y-6">
      <header className="border-b border-gray-200 dark:border-gray-800 pb-4">
        <h1 id="admin-title" className="text-2xl font-semibold">Admin</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage agent operations, run health checks, and view system info.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        <article className="border rounded-lg p-4 border-gray-200 dark:border-gray-800">
          <h2 className="font-medium mb-2">System</h2>
          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>
              Backend health:{' '}
              <a className="text-blue-700 hover:underline" href="/health">
                /health
              </a>
            </li>
            <li className="text-xs text-gray-500 dark:text-gray-400">
              API base: {apiClient.baseUrl || '(same-origin)'}
            </li>
          </ul>
        </article>

        <article className="border rounded-lg p-4 border-gray-200 dark:border-gray-800">
          <h2 className="font-medium mb-2">Actions</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1.5 rounded bg-gray-900 text-white hover:bg-gray-800"
              onClick={() => window.location.assign('/health')}
              aria-label="Open backend health endpoint"
            >
              Open Health
            </button>
          </div>
        </article>
      </div>

      <footer className="text-xs text-gray-500 dark:text-gray-400">
        Phase 1: Modern Admin page ready. Legacy static assets have been archived.
      </footer>
    </section>
  );

  return (
    <BrowserRouter>
      <header className={`${styles['header']} bg-gray-900 text-white`}>
        <nav className={`${styles['nav']} container mx-auto flex gap-4 p-4 items-center`}>
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/admin" className="hover:underline">
            Admin
          </Link>
        </nav>
      </header>
      <main className={`${styles['main']} container mx-auto p-6`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
// Dev hint: run with API base
// npx nx serve web --configuration=withApiLocal
// or set VITE_API_URL manually in your environment.
// TODO: Scaffold libs:
//   npx nx g @nx/js:lib shared-api-client --directory=libs/shared --publishable=false
//   npx nx g @nx/js:lib shared-zod-schemas --directory=libs/shared --publishable=false
// After adding libs, wire imports and validate Playwright e2e.
