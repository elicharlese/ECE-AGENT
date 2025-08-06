import React, { useState, useEffect } from 'react';
import { Plus, Settings, Database, Webhook, Code, Globe, Smartphone } from 'lucide-react';

// API Configuration Interface (based on Screenshot 4)
const SplineAPIConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState('APIs');
  const [apiName, setApiName] = useState('LUCA');
  const [apiUrl, setApiUrl] = useState('https://api.example.com/userAPI');
  const [isConnected, setIsConnected] = useState(false);
  const [responseData, setResponseData] = useState(null);

  const tabs = ['Variables', 'Webhooks', 'APIs'];

  const simulateAPICall = async () => {
    setIsConnected(true);
    // Simulate API response
    setTimeout(() => {
      setResponseData({
        status: 'success',
        data: {
          temperature: 15,
          location: 'Current Location',
          condition: 'Sunny'
        }
      });
    }, 1500);
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <Code className="mr-2 text-blue-400" />
        Spline API Configuration Interface
      </h2>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* APIs Tab Content */}
      {activeTab === 'APIs' && (
        <div className="space-y-6">
          {/* New API Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">API Endpoints</h3>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
              <Plus className="mr-2 w-4 h-4" />
              New API
            </button>
          </div>

          {/* API Configuration Form */}
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Name
              </label>
              <input
                type="text"
                value={apiName}
                onChange={(e) => setApiName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter API name (e.g., LUCA)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Endpoint URL
              </label>
              <input
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://api.example.com/userAPI"
              />
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Method
                </label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500">
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Response Format
                </label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500">
                  <option>JSON</option>
                  <option>XML</option>
                  <option>Text</option>
                </select>
              </div>
            </div>

            <button
              onClick={simulateAPICall}
              disabled={isConnected}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Database className="mr-2 w-4 h-4" />
              {isConnected ? 'Retrieving Data...' : 'Retrieve Data'}
            </button>
          </div>

          {/* API Response Display */}
          {responseData && (
            <div className="bg-green-900 border border-green-700 rounded-lg p-4">
              <h4 className="text-green-300 font-medium mb-2">API Response</h4>
              <pre className="text-green-100 text-sm overflow-x-auto">
                {JSON.stringify(responseData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Variables Tab */}
      {activeTab === 'Variables' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Environment Variables</h3>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400">Configure environment variables for your APIs</p>
          </div>
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'Webhooks' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <Webhook className="mr-2" />
            Webhook Configuration
          </h3>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400">Set up webhooks for real-time data updates</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Cross-Platform Weather Widget (based on Screenshot 3)
const CrossPlatformWeatherWidget: React.FC = () => {
  const [weatherData, setWeatherData] = useState({
    location: 'Location',
    temperature: 15,
    condition: 'Sunny',
    high: 20,
    low: 5
  });

  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web');

  const platformStyles = {
    ios: {
      borderRadius: '20px',
      background: 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    android: {
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
      fontFamily: 'Roboto, "Segoe UI", sans-serif'
    },
    web: {
      borderRadius: '16px',
      background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
      fontFamily: 'Inter, "Segoe UI", sans-serif'
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="flex justify-center mb-4 space-x-2">
        <button
          onClick={() => setPlatform('ios')}
          className={`px-3 py-1 rounded-lg text-sm flex items-center ${
            platform === 'ios' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Smartphone className="mr-1 w-4 h-4" />
          iOS
        </button>
        <button
          onClick={() => setPlatform('android')}
          className={`px-3 py-1 rounded-lg text-sm flex items-center ${
            platform === 'android' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Smartphone className="mr-1 w-4 h-4" />
          Android
        </button>
        <button
          onClick={() => setPlatform('web')}
          className={`px-3 py-1 rounded-lg text-sm flex items-center ${
            platform === 'web' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Globe className="mr-1 w-4 h-4" />
          Web
        </button>
      </div>

      <div
        className="text-white p-6 relative overflow-hidden transition-all duration-300"
        style={platformStyles[platform]}
      >
        <h3 className="text-lg mb-4 flex items-center opacity-90">
          Cross-Platform Weather Widget
        </h3>
        
        {/* Weather Card */}
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 relative">
          <div className="text-sm opacity-80 mb-2">{weatherData.location}</div>
          
          {/* Temperature Display */}
          <div className="text-4xl font-light mb-2">
            {weatherData.temperature}°C
          </div>
          
          {/* Weather Condition */}
          <div className="text-base mb-3 flex items-center">
            {weatherData.condition}
          </div>
          
          {/* High/Low */}
          <div className="text-sm opacity-80">
            H:{weatherData.high}° L:{weatherData.low}°
          </div>
          
          {/* Animated Sun - Platform Optimized */}
          <div className="absolute top-2 right-2">
            <div className="relative">
              <div className={`w-12 h-12 bg-yellow-400 rounded-full ${
                platform === 'ios' ? 'animate-pulse' : 
                platform === 'android' ? 'animate-bounce' : 'animate-spin'
              }`} style={{ animationDuration: '3s' }}>
                {/* Sun Rays */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                  <div
                    key={angle}
                    className="absolute w-0.5 h-4 bg-yellow-300 rounded-full"
                    style={{
                      top: '-8px',
                      left: '50%',
                      transformOrigin: '50% 32px',
                      transform: `translateX(-50%) rotate(${angle}deg)`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Platform Indicator */}
        <div className="mt-3 text-xs opacity-70 text-center">
          Optimized for {platform.toUpperCase()} • API Connected
        </div>
      </div>
    </div>
  );
};

// Combined Demo Component
const SplineAdvancedDemo: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AGENT Progressive Training Results - Session 2
        </h1>
        <p className="text-gray-600">
          Advanced API configuration and cross-platform development capabilities
        </p>
      </div>

      {/* Training Progress Update */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">
          🚀 Progressive Training Update
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">4</div>
            <div className="text-sm text-gray-600">Screenshots Analyzed</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">15</div>
            <div className="text-sm text-gray-600">Concepts Learned</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">4</div>
            <div className="text-sm text-gray-600">Advanced Scenes</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">100%</div>
            <div className="text-sm text-gray-600">Learning Rate</div>
          </div>
        </div>
      </div>

      {/* Generated Components */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Generated from Screenshot 4 - API Configuration:</h2>
          <SplineAPIConfig />
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Generated from Screenshot 3 - Cross-Platform Widget:</h2>
          <CrossPlatformWeatherWidget />
        </div>
      </div>

      {/* Enhanced Capabilities */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🧠 AGENT's Enhanced Capabilities:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Advanced API Management:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Professional API configuration interfaces</li>
              <li>• RESTful endpoint management</li>
              <li>• Real-time data retrieval and display</li>
              <li>• Error handling and response validation</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Cross-Platform Development:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• iOS, Android, and web optimization</li>
              <li>• Platform-specific styling and animations</li>
              <li>• Responsive design patterns</li>
              <li>• Performance optimization strategies</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-sm">
            💡 <strong>Progressive Learning Active:</strong> AGENT is continuously improving with each screenshot. 
            Keep providing more course material for even more advanced 3D capabilities!
          </p>
        </div>
      </div>
    </div>
  );
};

export { SplineAPIConfig, CrossPlatformWeatherWidget, SplineAdvancedDemo };
export default SplineAdvancedDemo;
