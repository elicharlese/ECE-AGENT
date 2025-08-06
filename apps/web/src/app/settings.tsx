import React from 'react';
import { Shell } from '../components/layout/Shell';
import { PageHeader } from '../components/layout/PageHeader';

const Settings: React.FC = () => {
  return (
    <Shell title="Settings">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, preferences, and workspace"
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Settings' }]}
        actions={
          <button className="px-3 py-2 text-sm bg-gray-900 text-white radius-8 elev-sm">
            Save changes
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <aside className="bg-white radius-8 elev-sm border border-gray-100 p-3">
          <ul className="space-y-1 text-sm">
            {['Profile', 'Security', 'Notifications', 'Billing'].map((s) => (
              <li key={s}>
                <a className="block px-3 py-2 hover:bg-gray-50 radius-8" href={`#${s.toLowerCase()}`}>
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <section className="lg:col-span-2 bg-white radius-8 elev-sm border border-gray-100 p-4">
          <h2 id="profile" className="text-sm font-medium text-gray-700 mb-3">Profile</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Full name</label>
              <input className="w-full px-3 py-2 text-sm border border-gray-300 bg-white radius-8" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Email</label>
              <input type="email" className="w-full px-3 py-2 text-sm border border-gray-300 bg-white radius-8" placeholder="jane@company.com" />
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="px-3 py-2 text-sm border border-gray-300 bg-white radius-8">Cancel</button>
              <button type="submit" className="px-3 py-2 text-sm bg-gray-900 text-white radius-8 elev-sm">Save</button>
            </div>
          </form>

          <hr className="my-6 border-gray-100" />

          <h2 id="security" className="text-sm font-medium text-gray-700 mb-3">Security</h2>
          <div className="space-y-3">
            <button className="px-3 py-2 text-sm border border-gray-300 bg-white radius-8 w-full md:w-auto">Change password</button>
            <button className="px-3 py-2 text-sm border border-gray-300 bg-white radius-8 w-full md:w-auto">Set up 2FA</button>
          </div>

          <hr className="my-6 border-gray-100" />

          <h2 id="notifications" className="text-sm font-medium text-gray-700 mb-3">Notifications</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-gray-900" defaultChecked />
              <span className="text-sm text-gray-700">Email updates</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-gray-900" />
              <span className="text-sm text-gray-700">Product announcements</span>
            </label>
          </div>

          <hr className="my-6 border-gray-100" />

          <h2 id="billing" className="text-sm font-medium text-gray-700 mb-3">Billing</h2>
          <div className="bg-gray-50 radius-8 p-4">
            <div className="text-sm text-gray-700">Current plan: Pro</div>
            <div className="text-xs text-gray-500 mt-1">Renews on 2025-12-01</div>
            <div className="mt-3 flex items-center gap-2">
              <button className="px-3 py-2 text-sm border border-gray-300 bg-white radius-8">Update payment</button>
              <button className="px-3 py-2 text-sm border border-gray-300 bg-white radius-8">View invoices</button>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
};

export default Settings;