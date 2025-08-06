import React, { useState } from 'react';
import Alert from '../components/ui/Alert';
import Skeleton from '../components/ui/Skeleton';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { Shell } from '../components/layout/Shell';
import { PageHeader } from '../components/layout/PageHeader';

export default function Settings() {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  function simulateSave(ok = true) {
    setSaving(true);
    setSaveError(null);
    setTimeout(() => {
      setSaving(false);
      if (!ok) setSaveError('Could not save your settings. Please try again.');
    }, 1200);
  }

  return (
    <div className="relative">
      {/* Demo controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
          onClick={() => simulateSave(true)}
        >
          Simulate Save (OK)
        </button>
        <button
          className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
          onClick={() => simulateSave(false)}
        >
          Simulate Save (Error)
        </button>
        <button
          className="px-3 py-1.5 rounded-md bg-amber-600 text-white text-sm hover:bg-amber-700"
          onClick={() => setShowInfo((v) => !v)}
        >
          Toggle Info
        </button>
      </div>

      {/* Alerts */}
      {showInfo && (
        <Alert
          variant="info"
          title="Heads-up"
          description="Some settings might require a page refresh to take effect."
          className="mb-3"
        />
      )}
      {saveError && (
        <Alert
          variant="error"
          title="Save failed"
          description={saveError}
          className="mb-3"
        />
      )}

      <div className="relative border rounded-md radius-8 elev-sm bg-white p-4">
        <LoadingOverlay show={saving} label="Saving settings…" />

        {/* Optional skeleton state example for form sections */}
        {saving ? (
          <div className="space-y-4">
            <Skeleton lineHeightClass="h-6" />
            <Skeleton lineHeightClass="h-10" rounded="radius-8" />
            <Skeleton lineHeightClass="h-6" />
            <Skeleton lineHeightClass="h-10" rounded="radius-8" />
            <Skeleton lineHeightClass="h-10" rounded="radius-8" />
          </div>
        ) : (
          <>
            {/* ... existing code: form sections like Profile, Security, Notifications, Billing ... */}
            {/* ... existing code ... */}
          </>
        )}
      </div>
    </div>
  );
}
