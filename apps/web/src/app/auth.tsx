import React from 'react';
import { Shell } from '../components/layout/Shell';
import { PageHeader } from '../components/layout/PageHeader';

const Auth: React.FC = () => {
  const [mode, setMode] = React.useState<'signin' | 'signup' | 'reset'>('signin');

  return (
    <Shell title="Auth">
      <PageHeader
        title="Authentication"
        subtitle="Sign in to your account or create a new one"
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Auth' }]}
      />

      <div className="mx-auto max-w-md bg-white radius-8 elev-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <button
            className={`px-3 py-2 text-sm radius-8 ${mode === 'signin' ? 'bg-gray-900 text-white elev-sm' : 'border border-gray-300 bg-white'}`}
            onClick={() => setMode('signin')}
          >
            Sign in
          </button>
          <button
            className={`px-3 py-2 text-sm radius-8 ${mode === 'signup' ? 'bg-gray-900 text-white elev-sm' : 'border border-gray-300 bg-white'}`}
            onClick={() => setMode('signup')}
          >
            Sign up
          </button>
          <button
            className={`px-3 py-2 text-sm radius-8 ${mode === 'reset' ? 'bg-gray-900 text-white elev-sm' : 'border border-gray-300 bg-white'}`}
            onClick={() => setMode('reset')}
          >
            Reset
          </button>
        </div>

        {mode === 'signin' && (
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Email</label>
              <input type="email" className="w-full px-3 py-2 text-sm border border-gray-300 bg-white radius-8" placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Password</label>
              <input type="password" className="w-full px-3 py-2 text-sm border border-gray-300 bg-white radius-8" placeholder="••••••••" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="accent-gray-900" />
                Remember me
              </label>
              <button type="button" className="text-sm text-gray-700 underline" onClick={() => setMode('reset')}>
                Forgot password?
              </button>
            </div>
            <button type="submit" className="w-full px-3 py-2 text-sm bg-gray-900 text-white radius-8 elev-sm">Sign in</button>
          </form>
        )}

        {mode === 'signup' && (
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Full name</label>
              <input className="w-full px-3 py-2 text-sm border border-gray-300 bg-white radius-8" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Email</label>
              <input type="email" className="w-full px-3 py-2 text-sm border border-gray-300 bg-white radius-8" placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Password</label>
              <input type="password" className="w-full px-3 py-2 text-sm border border-gray-300 bg-white radius-8" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full px-3 py-2 text-sm bg-gray-900 text-white radius-8 elev-sm">Create account</button>
          </form>
        )}

        {mode === 'reset' && (
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Email</label>
              <input type="email" className="w-full px-3 py-2 text-sm border border-gray-300 bg-white radius-8" placeholder="you@company.com" />
            </div>
            <button type="submit" className="w-full px-3 py-2 text-sm bg-gray-900 text-white radius-8 elev-sm">Send reset link</button>
            <div className="text-center">
              <button type="button" className="text-sm text-gray-700 underline" onClick={() => setMode('signin')}>
                Back to sign in
              </button>
            </div>
          </form>
        )}
      </div>
    </Shell>
  );
};

export default Auth;