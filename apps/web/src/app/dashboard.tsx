import React from 'react';
import { Shell } from '../components/layout/Shell';
import { PageHeader } from '../components/layout/PageHeader';

const Dashboard: React.FC = () => {
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
    </Shell>
  );
};

export default Dashboard;