import React from 'react';
import Spline from '@splinetool/react-spline';
import Shell from '../components/layout/Shell';
import PageHeader from '../components/layout/PageHeader';

const SPLINE_URL = import.meta.env.VITE_SPLINE_SCENE_URL || '';

function PosterFallback() {
  return (
    <div className="w-full h-[480px] md:h-[560px] lg:h-[640px] bg-gradient-to-br from-indigo-50 to-cyan-50 flex items-center justify-center text-slate-600 radius-12 elev-md">
      <div className="text-center px-4">
        <div className="mb-2 font-semibold">3D Scene Unavailable</div>
        <div className="text-sm">Set VITE_SPLINE_SCENE_URL to embed your Spline scene.</div>
      </div>
    </div>
  );
}

export default function Chat() {
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <Shell>
      <div className="p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Chat"
          subtitle="Interactive 3D scene embedded via Spline"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Chat' },
          ]}
          actions={
            <a
              href="https://spline.design"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition"
            >
              Spline Docs
            </a>
          }
        />
        <div className="mt-6">
          {SPLINE_URL ? (
            <div className="relative radius-12 overflow-hidden elev-md">
              <Spline
                scene={SPLINE_URL}
                onLoad={() => {
                  // Optional: hook to tweak camera or bindings when available
                }}
              />
              {prefersReducedMotion && (
                <div className="absolute inset-0 pointer-events-none bg-white/60 flex items-center justify-center">
                  <span className="text-sm text-slate-700">Reduced motion enabled</span>
                </div>
              )}
            </div>
          ) : (
            <PosterFallback />
          )}
        </div>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 radius-12 elev-sm bg-white p-4">
            <div className="font-medium mb-2">Chat Panel</div>
            <div className="text-sm text-slate-600">Coming soon: chat UI integrated with the 3D scene context.</div>
          </div>
          <div className="radius-12 elev-sm bg-white p-4">
            <div className="font-medium mb-2">Scene Settings</div>
            <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
              <li>Use light/dark logo variants in media policy</li>
              <li>Respect prefers-reduced-motion</li>
              <li>Host assets under /public/media</li>
            </ul>
          </div>
        </div>
      </div>
    </Shell>
  );
}
