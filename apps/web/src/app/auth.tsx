import React, { useState } from 'react';
import Alert from '../components/ui/Alert';
import Skeleton from '../components/ui/Skeleton';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { Shell } from '../components/layout/Shell';
import { PageHeader } from '../components/layout/PageHeader';

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setInfoMsg(null);
    setTimeout(() => {
      setSubmitting(false);
      if (mode === 'reset') {
        setInfoMsg('If an account exists for that email, a reset link has been sent.');
      } else {
        // Simulate random failure for demo
        const ok = Math.random() > 0.4;
        if (!ok) {
          setErrorMsg('Invalid credentials or network error. Please try again.');
        } else {
          setInfoMsg(mode === 'signup' ? 'Account created. You can now sign in.' : 'Signed in successfully.');
        }
      }
    }, 1200);
  }

  return (
    <Shell title="Auth">
      <PageHeader
        title="Authentication"
        subtitle="Sign in to your account or create a new one"
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Auth' }]}
      />

      <div className="relative max-w-md mx-auto">
        {/* Mode switches */}
        <div className="mb-4 flex items-center gap-2">
          <button
            className={`px-3 py-1.5 rounded-md text-sm ${mode === 'signin' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => setMode('signin')}
            disabled={submitting}
          >
            Sign in
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm ${mode === 'signup' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => setMode('signup')}
            disabled={submitting}
          >
            Sign up
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm ${mode === 'reset' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => setMode('reset')}
            disabled={submitting}
          >
            Reset
          </button>
        </div>

        {/* Alerts */}
        {infoMsg && (
          <Alert
            variant="success"
            title="Success"
            description={infoMsg}
            className="mb-3"
          />
        )}
        {errorMsg && (
          <Alert
            variant="error"
            title="Authentication error"
            description={errorMsg}
            className="mb-3"
          />
        )}

        {/* Auth card */}
        <div className="relative border rounded-md radius-8 elev-sm bg-white p-4">
          <LoadingOverlay show={submitting} label={mode === 'reset' ? 'Sending reset link…' : 'Signing in…'} />

          {/* Use skeletons to indicate form loading */}
          {submitting ? (
            <div className="space-y-3">
              <Skeleton lineHeightClass="h-6" />
              <Skeleton lineHeightClass="h-10" rounded="radius-8" />
              {mode !== 'reset' && (
                <>
                  <Skeleton lineHeightClass="h-6" />
                  <Skeleton lineHeightClass="h-10" rounded="radius-8" />
                </>
              )}
              {mode === 'signup' && (
                <>
                  <Skeleton lineHeightClass="h-6" />
                  <Skeleton lineHeightClass="h-10" rounded="radius-8" />
                </>
              )}
              <Skeleton lineHeightClass="h-10" rounded="radius-8" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" required className="w-full border rounded-md px-3 py-2" />
              </div>

              {mode !== 'reset' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input type="password" required className="w-full border rounded-md px-3 py-2" />
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm password</label>
                  <input type="password" required className="w-full border rounded-md px-3 py-2" />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {mode === 'reset' ? 'Send reset link' : mode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            </form>
          )}
        </div>
      </div>
    </Shell>
  );
}