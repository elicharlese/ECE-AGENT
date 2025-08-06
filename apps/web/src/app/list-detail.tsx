import React from 'react';
import { Shell } from '../components/layout/Shell';
import { PageHeader } from '../components/layout/PageHeader';

const ListDetail: React.FC = () => {
  const [selected, setSelected] = React.useState<number | null>(1);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* List */}
        <div className="bg-white radius-8 elev-sm border border-gray-100 overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex items-center gap-2">
            <input
              className="w-full px-3 py-2 text-sm border border-gray-300 bg-white radius-8"
              placeholder="Search"
            />
            <button className="px-3 py-2 text-sm border border-gray-300 bg-white radius-8">Filter</button>
          </div>
          <ul className="divide-y divide-gray-100">
            {items.map((it) => (
              <li key={it.id}>
                <button
                  onClick={() => setSelected(it.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                    selected === it.id ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">{it.title}</span>
                    <span className="text-xs text-gray-500">›</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{it.meta}</div>
                </button>
              </li>
            ))}
          </ul>
          {items.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-600">
              No results. <button className="underline">Clear filters</button>
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2 bg-white radius-8 elev-sm border border-gray-100 p-4">
          {selected ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Record {selected}</h2>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 text-sm border border-gray-300 bg-white radius-8">Edit</button>
                  <button className="px-3 py-2 text-sm bg-gray-900 text-white radius-8 elev-sm">Save</button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 radius-8">
                  <div className="text-xs text-gray-500 mb-1">Field A</div>
                  <div className="text-sm text-gray-800">Value A</div>
                </div>
                <div className="p-4 bg-gray-50 radius-8">
                  <div className="text-xs text-gray-500 mb-1">Field B</div>
                  <div className="text-sm text-gray-800">Value B</div>
                </div>
                <div className="p-4 bg-gray-50 radius-8 md:col-span-2">
                  <div className="text-xs text-gray-500 mb-1">Description</div>
                  <div className="text-sm text-gray-800">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-600">
              Select an item from the list to view details
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
};

export default ListDetail;