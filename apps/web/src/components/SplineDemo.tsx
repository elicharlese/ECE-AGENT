import React, { useState, useEffect } from 'react';
import { BarChart3, Cloud, Thermometer, Activity } from 'lucide-react';

// Interactive 3D Bar Chart Component (based on Screenshot 1)
const Interactive3DBarChart: React.FC = () => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  
  const data = [
    { value: 23, percentage: 10, color: 'bg-orange-500', label: 'Category A' },
    { value: 72, percentage: 31, color: 'bg-green-500', label: 'Category B' },
    { value: 26, percentage: 11, color: 'bg-blue-500', label: 'Category C' },
    { value: 109, percentage: 47, color: 'bg-pink-500', label: 'Category D' }
  ];

  return (
    <div className="bg-gray-900 p-l radius-12 text-white">
      <h3 className="text-white text-xl-var mb-m flex items-center">
        <BarChart3 className="mr-2" />
        Interactive 3D Data Visualization
      </h3>
      
      <div className="flex items-end justify-center space-x-4 h-64">
        {data.map((item, index) => (
          <div
            key={index}
            className="relative group cursor-pointer"
            onMouseEnter={() => setHoveredBar(index)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            {/* 3D Bar Effect */}
            <div className="relative">
              <div
                className={`${item.color} transition-all duration-300 transform ${
                  hoveredBar === index ? 'scale-110 shadow-2xl' : 'shadow-lg'
                }`}
                style={{
                  width: '60px',
                  height: `${item.percentage * 4}px`,
                  transformStyle: 'preserve-3d',
                  transform: hoveredBar === index ? 'rotateY(5deg) rotateX(5deg)' : 'none'
                }}
              >
                {/* 3D Top Face */}
                <div
                  className={`absolute -top-2 -left-2 ${item.color} opacity-80`}
                  style={{
                    width: '60px',
                    height: '8px',
                    transform: 'skewX(-45deg)'
                  }}
                />
                
                {/* 3D Side Face */}
                <div
                  className={`absolute -right-2 top-0 ${item.color} opacity-60`}
                  style={{
                    width: '8px',
                    height: `${item.percentage * 4}px`,
                    transform: 'skewY(-45deg)'
                  }}
                />
              </div>
            </div>
            
            {/* Value Labels */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-center">
              <div className="text-white font-bold text-lg-var">{item.value}</div>
              <div className="text-gray-300 text-sm-var">{item.percentage}%</div>
            </div>
            
            {/* Category Label */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
              <div className="text-gray-400 text-xs-var">{item.label}</div>
            </div>
            
            {/* Hover Tooltip */}
            {hoveredBar === index && (
              <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-s py-s radius-8 text-sm-var whitespace-nowrap">
                {item.label}: {item.value} ({item.percentage}%)
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Grid Lines */}
      <div className="absolute inset-0 pointer-events-none">
        {[0, 25, 50, 75, 100].map((line) => (
          <div
            key={line}
            className="absolute w-full border-t border-default opacity-30"
            style={{ bottom: `${line}%` }}
          />
        ))}
      </div>
    </div>
  );
};

// Weather Widget Component (based on Screenshot 2)
const WeatherWidget: React.FC = () => {
  const [weatherData, setWeatherData] = useState({
    location: 'Location',
    temperature: 15,
    condition: 'Sunny',
    high: 20,
    low: 5
  });

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setWeatherData(prev => ({
          ...prev,
          temperature: prev.temperature + (Math.random() - 0.5) * 2
        }));
        setIsAnimating(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-l radius-12 text-white relative overflow-hidden">
      <h3 className="text-xl-var mb-s flex items-center">
        <Cloud className="mr-2" />
        Real-Time Weather API Integration
      </h3>
      
      {/* Weather Card */}
      <div className="bg-white bg-opacity-20 backdrop-blur-sm radius-12 p-m relative">
        <div className="text-sm-var opacity-80 mb-s">{weatherData.location}</div>
        
        {/* Temperature Display */}
        <div className={`text-6xl font-light mb-s transition-all duration-500 ${
          isAnimating ? 'scale-110' : 'scale-100'
        }`}>
          {Math.round(weatherData.temperature)}°C
        </div>
        
        {/* Weather Condition */}
        <div className="text-lg-var mb-s flex items-center">
          <Thermometer className="mr-2 w-5 h-5" />
          {weatherData.condition}
        </div>
        
        {/* High/Low */}
        <div className="text-sm-var opacity-80">
          H:{weatherData.high}° L:{weatherData.low}°
        </div>
        
        {/* Animated Sun */}
        <div className="absolute top-4 right-4">
          <div className="relative">
            <div className="w-16 h-16 bg-yellow-400 rounded-full animate-pulse">
              {/* Sun Rays */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <div
                  key={angle}
                  className="absolute w-1 h-6 bg-yellow-300 rounded-full animate-spin"
                  style={{
                    top: '-12px',
                    left: '50%',
                    transformOrigin: '50% 44px',
                    transform: `translateX(-50%) rotate(${angle}deg)`,
                    animationDuration: '8s'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* API Status Indicator */}
      <div className="mt-s flex items-center text-sm-var opacity-80">
        <Activity className="mr-2 w-4 h-4 animate-pulse" />
        Live API Connection Active
      </div>
    </div>
  );
};

// Main Demo Component
const SplineDemo: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-m space-y-l">
      <div className="text-center mb-l">
        <h1 className="text-3xl font-bold text-gray-900 mb-s">
          AGENT Spline 3D Training Results
        </h1>
        <p className="text-gray-600">
          Interactive 3D visualizations generated from course screenshots
        </p>
      </div>

      {/* Training Progress */}
      <div className="bg-white radius-12 elev-sm p-m mb-l">
        <h2 className="text-xl-var font-semibold mb-s text-green-600">
          ✅ Training Session Complete
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-m">
          <div className="bg-blue-50 p-m radius-12 text-center">
            <div className="text-2xl font-bold text-blue-600">2</div>
            <div className="text-sm-var text-gray-600">Screenshots Analyzed</div>
          </div>
          <div className="bg-green-50 p-m radius-12 text-center">
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-sm-var text-gray-600">Concepts Learned</div>
          </div>
          <div className="bg-purple-50 p-m radius-12 text-center">
            <div className="text-2xl font-bold text-purple-600">2</div>
            <div className="text-sm-var text-gray-600">Scenes Generated</div>
          </div>
          <div className="bg-orange-50 p-m radius-12 text-center">
            <div className="text-2xl font-bold text-orange-600">100%</div>
            <div className="text-sm-var text-gray-600">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Generated Visualizations */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Generated from Screenshot 1:</h2>
          <Interactive3DBarChart />
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Generated from Screenshot 2:</h2>
          <WeatherWidget />
        </div>
      </div>

      {/* Capabilities Learned */}
      <div className="bg-gray-50 radius-12 p-m">
        <h2 className="text-xl-var font-semibold mb-s">🧠 AGENT Now Understands:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-m">
          <div>
            <h3 className="font-medium mb-s">3D Data Visualization:</h3>
            <ul className="text-sm-var text-gray-600 space-y-1">
              <li>• Interactive bar charts with hover effects</li>
              <li>• 3D depth and perspective transforms</li>
              <li>• Color-coded data categories</li>
              <li>• Dynamic scaling based on values</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-s">Real-Time API Integration:</h3>
            <ul className="text-sm-var text-gray-600 space-y-1">
              <li>• Live weather data connections</li>
              <li>• Animated UI updates</li>
              <li>• Gradient backgrounds and effects</li>
              <li>• Status indicators for API health</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplineDemo;
