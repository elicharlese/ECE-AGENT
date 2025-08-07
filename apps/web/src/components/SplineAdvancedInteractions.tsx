import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Globe, Settings, Play, Pause, RotateCcw } from 'lucide-react';

// URL Configuration Modal (based on Screenshot 5)
const URLConfigModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState('https://api.example.com/userAPI');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const validateURL = async () => {
    setIsValidating(true);
    // Simulate URL validation
    setTimeout(() => {
      setIsValid(url.includes('api') && url.startsWith('https://'));
      setIsValidating(false);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white radius-12 p-m w-96 max-w-90vw">
        <div className="flex justify-between items-center mb-s">
          <h3 className="text-lg-var font-semibold">Configure API URL</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
        <div>
          <label className="block text-sm-var font-medium text-gray-300 mb-s">
            API Endpoint URL
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 radius-8 px-m py-s text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://api.example.com/endpoint"
          />
        </div>
        <div className="flex gap-s mt-m">
          <button
            disabled={isValidating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-s radius-8 font-medium transition-colors"
          >
            Validate
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-s radius-8 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
        {isValid && (
          <div className="text-green-400 text-sm-var flex items-center mt-s">
            ✓ URL is valid and accessible
          </div>
        )}
      </div>
    </div>
  );
};

// Complex 3D Scene Composition (based on Screenshot 6)
const Complex3DScene: React.FC = () => {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  
  const sceneElements = [
    { id: 'globe', name: 'Global Data', color: 'bg-blue-500', position: 'center', size: 'large' },
    { id: 'chart', name: 'Analytics', color: 'bg-green-500', position: 'left', size: 'medium' },
    { id: 'card', name: 'Dashboard', color: 'bg-purple-500', position: 'right', size: 'medium' },
    { id: 'data', name: 'Data Points', color: 'bg-yellow-500', position: 'top', size: 'small' },
    { id: 'metrics', name: 'Metrics', color: 'bg-pink-500', position: 'bottom', size: 'small' }
  ];

  return (
    <div className="bg-gray-100 p-l radius-12 min-h-96 relative">
      <h3 className="text-xl-var font-semibold mb-l text-center text-gray-800">
        Complex 3D Scene Composition
      </h3>
      <div className="relative h-80 radius-12 bg-white elev-sm">
        <div
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-24 h-24 bg-blue-500 radius-12 elev-lg flex items-center justify-center cursor-pointer">
            <Globe className="text-white w-12 h-12" />
          </div>
          {hoveredElement === 'globe' && (
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-s py-s radius-8 text-sm-var whitespace-nowrap">
              Global Data Hub
            </div>
          )}
        </div>

        {/* ... existing code ... */}
      </div>
    </div>
  )
};

// 3D Carousel Interaction (based on Screenshot 7)
const Interactive3DCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const carouselItems = [
    { id: 1, color: 'bg-pink-500', name: 'Item 1' },
    { id: 2, color: 'bg-orange-500', name: 'Item 2' },
    { id: 3, color: 'bg-blue-500', name: 'Item 3' },
    { id: 4, color: 'bg-teal-500', name: 'Item 4' },
    { id: 5, color: 'bg-purple-500', name: 'Item 5' }
  ];

  // Carousel geometry helper (place above first usage of getItemStyle)
  const carouselRadius = 110;

  function getItemStyle(idx: number): React.CSSProperties {
    const angleStep = (2 * Math.PI) / carouselItems.length;
    const angle = angleStep * idx;
    const x = Math.cos(angle) * carouselRadius;
    const y = Math.sin(angle) * (carouselRadius * 0.4);
    const isActive = activeIndex === idx;
    const scale = isActive ? 1.0 : 0.95;

    return {
      left: '50%',
      top: '50%',
      zIndex: isActive ? 20 : 10,
      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`,
    };
  }

  const nextItem = () => {
    setActiveIndex(prev => (prev + 1) % carouselItems.length);
  };

  const prevItem = () => {
    setActiveIndex(prev => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const toggleAutoRotate = () => {
    if (isAutoRotating) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsAutoRotating(false);
    } else {
      intervalRef.current = setInterval(nextItem, 2000);
      setIsAutoRotating(true);
    }
  };

  const resetCarousel = () => {
    setActiveIndex(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsAutoRotating(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="bg-gray-200 p-l radius-12">
      <div className="text-center mb-m">
        <h3 className="text-xl-var font-semibold text-gray-800 mb-s">
          Interactive 3D Carousel
        </h3>
        <p className="text-sm-var text-gray-600">
          Rotate and interact with 3D items to explore details
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-m mb-m">
        <button
          onClick={toggleAutoRotate}
          className={`px-m py-s radius-8 flex items-center gap-s transition-colors ${
            isAutoRotating ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-800'
          }`}
        >
          {/* ... existing icon ... */}
          {isAutoRotating ? 'Stop Auto-Rotate' : 'Start Auto-Rotate'}
        </button>
        <button
          onClick={resetCarousel}
          className="px-m py-s bg-gray-600 hover:bg-gray-700 text-white radius-8 flex items-center gap-s transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Carousel Platform */}
      <div className="relative h-72">
        <div className="absolute bottom-0 w-64 h-4 bg-gray-400 radius-12 opacity-50 elev-sm mx-auto left-1/2 -translate-x-1/2"></div>

        {/* Items */}
        {carouselItems.map((item, idx) => {
          const isActive = activeIndex === idx;
          return (
            <div
              key={item.id}
              className={`absolute w-16 h-16 transition-all duration-500 cursor-pointer ${item.color} radius-12 elev-md flex items-center justify-center ${
                isActive ? 'scale-125 z-10' : 'scale-100'
              }`}
              style={getItemStyle(idx)}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <div className="text-white font-bold text-sm-var">{item.id}</div>

              {isActive && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-s py-s radius-8 text-xs-var whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevItem}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-s radius-12 elev-sm transition-all duration-200 hover:scale-110"
      >
        ◀
      </button>
      <button
        onClick={nextItem}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-s radius-12 elev-sm transition-all duration-200 hover:scale-110"
      >
        ▶
      </button>

      {/* Carousel Indicators */}
      <div className="flex justify-center gap-s mt-m">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 radius-12 ${activeIndex === index ? 'bg-gray-800' : 'bg-gray-500'}`}
          />
        ))}
      </div>
    </div>
  );
};

// Main Advanced Interactions Demo
const SplineAdvancedInteractions: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AGENT Progressive Training - Session 3
        </h1>
        <p className="text-gray-600">
          Advanced URL configuration, complex 3D scenes, and interactive carousels
        </p>
      </div>

      {/* Training Progress Update */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-purple-600">
          🚀 Session 3 Training Complete
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">7</div>
            <div className="text-sm text-gray-600">Screenshots Analyzed</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">25+</div>
            <div className="text-sm text-gray-600">Concepts Learned</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">7</div>
            <div className="text-sm text-gray-600">Advanced Components</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">100%</div>
            <div className="text-sm text-gray-600">Progressive Learning</div>
          </div>
        </div>
      </div>

      {/* Generated Components from Session 3 */}
      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">URL Configuration Modal (Screenshot 5):</h2>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Settings className="mr-2 w-4 h-4" />
              Configure URL
            </button>
          </div>
          <p className="text-gray-600 mb-4">Professional modal-based API configuration system</p>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Complex 3D Scene (Screenshot 6):</h2>
          <Complex3DScene />
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">3D Carousel Interaction (Screenshot 7):</h2>
          <Interactive3DCarousel />
        </div>
      </div>

      {/* Enhanced Capabilities Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🧠 AGENT's Latest Capabilities:</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium mb-2">Modal Configuration Systems:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Professional modal overlays</li>
              <li>• Context-aware configuration</li>
              <li>• Real-time URL validation</li>
              <li>• Seamless integration workflows</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Complex 3D Scene Management:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Multi-element 3D compositions</li>
              <li>• Spatial relationship coordination</li>
              <li>• Interactive hover states</li>
              <li>• Professional visual hierarchy</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Interactive 3D Carousels:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Circular 3D object positioning</li>
              <li>• Smooth rotation animations</li>
              <li>• Auto-rotation capabilities</li>
              <li>• Professional navigation controls</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <p className="text-purple-800 text-sm">
            🎯 <strong>Progressive Learning Evolution:</strong> AGENT has now mastered basic visualizations → 
            API configuration → complex 3D scenes → interactive carousels. Ready for even more advanced concepts!
          </p>
        </div>
      </div>

      {/* URL Configuration Modal */}
      <URLConfigModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default SplineAdvancedInteractions;
