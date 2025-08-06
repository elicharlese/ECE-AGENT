import React, { useState } from 'react';
import { Shell } from '../components/layout/Shell';
import { PageHeader } from '../components/layout/PageHeader';
import Alert from '../components/ui/Alert';
import Skeleton from '../components/ui/Skeleton';
import LoadingOverlay from '../components/ui/LoadingOverlay';

export default function ListDetail() {
  const [loading, setLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [showError, setShowError] = useState(false);

  const items = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Record ${i + 1}`,
    meta: `Updated ${(i + 1) * 2}h ago`,
  }));

  return (
    <Shell title="List + Detail">
      <PageHeader
        title="List + Detail"
        subtitle="Browse items on the left, inspect details on the right"
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'ListDetail' }]}
        actions={
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-sm bg-gray-900 text-white radius-8 elev-sm">New</button>
            <button className="px-3 py-2 text-sm border border-gray-300 bg-white radius-8">Bulk Action</button>
          </div>
        }
      />

      <div className="relative">
        {/* Demo controls */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1200);
            }}
          >
            Toggle Loading
          </button>
          <button
            className="px-3 py-1.5 rounded-md bg-amber-600 text-white text-sm hover:bg-amber-700"
            onClick={() => setShowEmpty((v) => !v)}
          >
            Toggle Empty
          </button>
          <button
            className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
            onClick={() => setShowError((v) => !v)}
          >
            Toggle Error
          </button>
        </div>

        {/* Error alert */}
        {showError && (
          <Alert
            variant="error"
            title="Unable to load items"
            description="There was a problem retrieving the list. Please try again."
            className="mb-3"
          />
        )}

        {/* List + Detail region */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Master list */}
          <div className="border rounded-md radius-8 p-3 elev-sm bg-white">
            <div className="mb-2">
              <input
                type="text"
                placeholder="Search…"
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            {loading ? (
              <Skeleton lines={6} />
            ) : showEmpty ? (
              <div className="text-sm text-gray-500 py-6">No items found.</div>
            ) : (
              // ... existing code rendering list items ...
              null
            )}
          </div>

          {/* Detail pane */}
          <div className="lg:col-span-2 relative border rounded-md radius-8 p-4 elev-sm bg-white">
            <LoadingOverlay show={loading} label="Loading details…" />
            {loading ? (
              <div className="space-y-3">
                <Skeleton lineHeightClass="h-6" />
                <Skeleton lineHeightClass="h-6" />
                <Skeleton lineHeightClass="h-40" rounded="radius-12" />
              </div>
            ) : showEmpty ? (
              <div className="text-sm text-gray-500">Select an item from the list to view details.</div>
            ) : (
              // ... existing code rendering selected item details ...
              null
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}