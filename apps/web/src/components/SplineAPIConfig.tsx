import React, { useState } from 'react';
import { Code, Plus, Database, Webhook, Smartphone, Globe } from 'lucide-react';

const SplineAPIConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Endpoints' | 'Environment' | 'Webhooks'>('Endpoints');
  const [apiName, setApiName] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [responseData, setResponseData] = useState<any | null>(null);

  const tabs: Array<'Endpoints' | 'Environment' | 'Webhooks'> = ['Endpoints', 'Environment', 'Webhooks'];

  async function handleConnect() {
    try {
      setIsConnected(true);
      // Simulate fetch or keep existing logic. Ensure the shape is plain JSON, not { status: ... }.
      const data = { ok: true, api: apiName || 'Example', url: apiUrl || 'https://api.example.com' };
      setResponseData(data);
    } finally {
      setIsConnected(false);
    }
  }

  return (
    <div className="bg-gray-900 text-white p-m radius-12 max-w-4xl mx-auto">
      <h2 className="text-xl-var font-semibold mb-l flex items-center">
        <Code className="mr-2 text-blue-400" />
        Spline API Configuration Interface
      </h2>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-l bg-gray-800 radius-12 p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-m py-s radius-8 transition-all duration-200 ${
              activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* API Endpoints Section */}
      {activeTab === 'Endpoints' && (
        <div className="space-y-m">
          <div className="flex justify-between items-center">
            <h3 className="text-lg-var font-medium">API Endpoints</h3>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-m py-s radius-8 flex items-center transition-colors">
              <Plus className="mr-2 w-4 h-4" />
              New API
            </button>
          </div>

          {/* API Configuration Form */}
          <div className="bg-gray-800 radius-12 p-m space-y-m">
            <div>
              <label className="block text-sm-var font-medium text-gray-300 mb-s">API Name</label>
              <input
                type="text"
                value={apiName}
                onChange={(e) => setApiName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 radius-8 px-m py-s text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter API name (e.g., LUCA)"
              />
            </div>

            <div>
              <label className="block text-sm-var font-medium text-gray-300 mb-s">Endpoint URL</label>
              <input
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 radius-8 px-m py-s text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://api.example.com/userAPI"
              />
            </div>

            <div className="flex gap-m">
              <div className="flex-1">
                <label className="block text-sm-var font-medium text-gray-300 mb-s">Method</label>
                <select className="w-full bg-gray-700 border border-gray-600 radius-8 px-m py-s text-white focus:ring-2 focus:ring-blue-500">
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm-var font-medium text-gray-300 mb-s">Response Format</label>
                <select className="w-full bg-gray-700 border border-gray-600 radius-8 px-m py-s text-white focus:ring-2 focus:ring-blue-500">
                  <option>JSON</option>
                  <option>XML</option>
                  <option>Text</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleConnect}
              disabled={isConnected}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-m radius-8 font-medium transition-colors flex items-center justify-center"
            >
              <Database className="mr-2 w-4 h-4" />
              {isConnected ? 'Retrieving Data...' : 'Retrieve Data'}
            </button>

            {responseData && (
              <div className="bg-green-900 border border-green-700 radius-12 p-m">
                <h4 className="text-green-300 font-medium mb-s">API Response</h4>
                <pre className="text-green-100 text-sm-var overflow-x-auto">
                  {JSON.stringify(responseData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Environment' && (
        <div className="space-y-m">
          <h3 className="text-lg-var font-medium">Environment Variables</h3>
          <div className="bg-gray-800 radius-12 p-m">
            <p className="text-gray-400">Configure environment variables for your APIs</p>
          </div>
        </div>
      )}

      {activeTab === 'Webhooks' && (
        <div className="space-y-m">
          <h3 className="text-lg-var font-medium flex items-center">
            <Webhook className="mr-2" />
            Webhook Configuration
          </h3>
          <div className="bg-gray-800 radius-12 p-m">
            <p className="text-gray-400">Set up webhooks for real-time data updates</p>
          </div>
        </div>
      )}

      {/* Cross-Platform Weather Widget (simplified header; keep original component below if present elsewhere) */}
      <div className="max-w-md mx-auto mt-l">
        <div className="flex justify-center mb-s gap-s">
          <button className="px-s py-1 radius-8 text-sm-var flex items-center bg-gray-200 text-gray-700">
            <Smartphone className="mr-1 w-4 h-4" />
            iOS
          </button>
          <button className="px-s py-1 radius-8 text-sm-var flex items-center bg-gray-200 text-gray-700">
            <Smartphone className="mr-1 w-4 h-4" />
            Android
          </button>
          <button className="px-s py-1 radius-8 text-sm-var flex items-center bg-gray-200 text-gray-700">
            <Globe className="mr-1 w-4 h-4" />
            Web
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplineAPIConfig;
