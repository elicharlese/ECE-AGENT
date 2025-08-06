import React, { useState } from 'react';
import { Shell } from '../components/layout/Shell';
import { PageHeader } from '../components/layout/PageHeader';
import Alert from '../components/ui/Alert';
import Skeleton from '../components/ui/Skeleton';
import LoadingOverlay from '../components/ui/LoadingOverlay';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ... existing content ...

  return (
    <Shell title="Dashboard">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of key metrics and recent activity"
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}
        actions={
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-sm bg-gray-900 text-white radius-8 elev-sm">Primary</button>
            <button className="px-3 py-2 text-sm border border-gray-300 bg-white radius-8">Secondary</button>
          </div>
        }
      />

      {/* Demo controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1500);
          }}
        >
          Toggle Loading
        </button>
        <button
          className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700"
          onClick={() => {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
          }}
        >
          Show Success
        </button>
        <button
          className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
          onClick={() => setShowError((v) => !v)}
        >
          Toggle Error
        </button>
      </div>

      {/* Alerts */}
      {showSuccess && (
        <Alert
          variant="success"
          title="Saved"
          description="Your dashboard preferences have been saved."
        />
      )}
      {showError && (
        <Alert
          variant="error"
          title="Failed to load data"
          description="We couldn't fetch the latest metrics. Try again in a few seconds."
        />
      )}

      {/* Skeleton demo for metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 my-4">
        {loading ? (
          <>
            <Skeleton className="w-full" lineHeightClass="h-24" rounded="radius-12" />
            <Skeleton className="w-full" lineHeightClass="h-24" rounded="radius-12" />
            <Skeleton className="w-full" lineHeightClass="h-24" rounded="radius-12" />
            <Skeleton className="w-full" lineHeightClass="h-24" rounded="radius-12" />
          </>
        ) : null}
      </div>

      {/* Page content with loading overlay */}
      <div className="relative">
        <LoadingOverlay show={loading} label="Refreshing dashboard…" />
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-4 radius-8 elev-sm border border-gray-100">
              <div className="text-sm text-gray-500">Metric {i}</div>
              <div className="text-2xl font-semibold mt-1">123</div>
              <div className="text-xs text-gray-500 mt-2">Compared to last week</div>
            </div>
          ))}
        </section>

        <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 radius-8 elev-sm border border-gray-100 lg:col-span-2">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h2>
            <ul className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <li key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 radius-8">
                  <span className="text-sm text-gray-700">Item {i}</span>
                  <span className="text-xs text-gray-500">2h ago</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-4 radius-8 elev-sm border border-gray-100">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <button className="px-3 py-2 text-sm bg-gray-900 text-white radius-8 elev-sm">Create</button>
              <button className="px-3 py-2 text-sm border border-gray-300 bg-white radius-8">Import</button>
              <button className="px-3 py-2 text-sm border border-gray-300 bg-white radius-8">Export</button>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}