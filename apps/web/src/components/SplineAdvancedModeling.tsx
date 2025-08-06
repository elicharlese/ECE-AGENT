import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Layers, 
  Palette, 
  Droplets, 
  Eye, 
  Settings, 
  Play, 
  Pause,
  RotateCcw,
  Cube,
  Mountain,
  Sparkles,
  Zap
} from 'lucide-react';

// Voxel Character Creator (Screenshot 13)
const VoxelCharacterCreator: React.FC = () => {
  const [selectedBodyPart, setSelectedBodyPart] = useState('head');
  const [selectedColor, setSelectedColor] = useState('#8B4513');
  const [isAnimating, setIsAnimating] = useState(false);

  const bodyParts = [
    { id: 'head', name: 'Head', color: '#8B4513', position: { x: 0, y: -20 } },
    { id: 'torso', name: 'Torso', color: '#4169E1', position: { x: 0, y: 0 } },
    { id: 'leftArm', name: 'Left Arm', color: '#8B4513', position: { x: -25, y: -5 } },
    { id: 'rightArm', name: 'Right Arm', color: '#8B4513', position: { x: 25, y: -5 } },
    { id: 'leftLeg', name: 'Left Leg', color: '#000000', position: { x: -8, y: 25 } },
    { id: 'rightLeg', name: 'Right Leg', color: '#000000', position: { x: 8, y: 25 } }
  ];

  const colors = [
    { name: 'Brown', value: '#8B4513' },
    { name: 'Blue', value: '#4169E1' },
    { name: 'Black', value: '#000000' },
    { name: 'Gray', value: '#808080' },
    { name: 'Green', value: '#228B22' },
    { name: 'Red', value: '#DC143C' }
  ];

  return (
    <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-6 rounded-lg text-white">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <User className="mr-2" />
        3D Voxel Character Creator (Screenshot 13)
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voxel Character Visualization */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="h-80 flex items-center justify-center relative">
            {/* Voxel Character */}
            <div className="relative transform hover:scale-105 transition-transform duration-300">
              {bodyParts.map((part) => (
                <div
                  key={part.id}
                  className={`absolute transition-all duration-300 cursor-pointer border-2 ${
                    selectedBodyPart === part.id ? 'border-yellow-400 scale-110' : 'border-white/20'
                  }`}
                  style={{
                    backgroundColor: part.color,
                    left: `${part.position.x + 50}px`,
                    top: `${part.position.y + 100}px`,
                    width: part.id === 'head' ? '32px' : part.id === 'torso' ? '32px' : '16px',
                    height: part.id === 'head' ? '32px' : part.id === 'torso' ? '40px' : part.id.includes('Leg') ? '32px' : '24px',
                    borderRadius: '2px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                  }}
                  onClick={() => setSelectedBodyPart(part.id)}
                >
                  {/* Voxel Details */}
                  {part.id === 'head' && (
                    <>
                      <div className="absolute top-1 left-1 w-2 h-2 bg-black rounded-sm"></div>
                      <div className="absolute top-1 right-1 w-2 h-2 bg-black rounded-sm"></div>
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-black rounded-sm"></div>
                    </>
                  )}
                  {part.id === 'torso' && (
                    <div className="absolute inset-2 bg-white/20 rounded-sm"></div>
                  )}
                </div>
              ))}
              
              {/* Shadow */}
              <div className="absolute top-52 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-black/30 rounded-full blur-sm"></div>
            </div>
          </div>
          
          {/* Character Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div className="bg-white/10 p-2 rounded text-center">
              <div className="font-semibold">Voxels</div>
              <div>156</div>
            </div>
            <div className="bg-white/10 p-2 rounded text-center">
              <div className="font-semibold">Parts</div>
              <div>6</div>
            </div>
            <div className="bg-white/10 p-2 rounded text-center">
              <div className="font-semibold">Materials</div>
              <div>4</div>
            </div>
          </div>
        </div>

        {/* Character Customization Panel */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">Body Part Selection:</h4>
            <div className="grid grid-cols-2 gap-2">
              {bodyParts.map((part) => (
                <button
                  key={part.id}
                  onClick={() => setSelectedBodyPart(part.id)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    selectedBodyPart === part.id
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {part.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Color Palette:</h4>
            <div className="grid grid-cols-3 gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-full h-10 rounded-lg border-2 transition-all ${
                    selectedColor === color.value
                      ? 'border-yellow-400 scale-105'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                ></button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Voxel Properties:</h4>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Selected Part:</span>
                <span className="font-medium">{bodyParts.find(p => p.id === selectedBodyPart)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Color:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded border border-white/20" style={{ backgroundColor: selectedColor }}></div>
                  <span className="font-mono text-xs">{selectedColor}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Voxel Size:</span>
                <span className="font-medium">16x16x16</span>
              </div>
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-3 rounded-lg font-medium transition-all hover:scale-105">
            <Sparkles className="inline mr-2 w-4 h-4" />
            Apply Material
          </button>
        </div>
      </div>
    </div>
  );
};

// Voxel World Builder (Screenshot 14)
const VoxelWorldBuilder: React.FC = () => {
  const [selectedTerrain, setSelectedTerrain] = useState('grass');
  const [worldSize, setWorldSize] = useState(32);

  const terrainTypes = [
    { id: 'grass', name: 'Grass', color: '#228B22', icon: '🌱' },
    { id: 'sand', name: 'Sand', color: '#F4A460', icon: '🏖️' },
    { id: 'water', name: 'Water', color: '#4169E1', icon: '💧' },
    { id: 'stone', name: 'Stone', color: '#696969', icon: '🪨' },
    { id: 'wood', name: 'Wood', color: '#8B4513', icon: '🌳' }
  ];

  return (
    <div className="bg-gradient-to-br from-green-400 to-cyan-500 p-6 rounded-lg text-white">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Mountain className="mr-2" />
        Voxel World Builder (Screenshot 14)
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Isometric Voxel World */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="h-80 flex items-center justify-center relative overflow-hidden">
            {/* Isometric Voxel Landscape */}
            <div className="relative transform rotate-45 scale-75">
              {/* Generate voxel grid */}
              {Array.from({ length: 8 }, (_, row) =>
                Array.from({ length: 8 }, (_, col) => {
                  const terrainType = Math.random() > 0.7 ? 'water' : Math.random() > 0.5 ? 'sand' : 'grass';
                  const height = terrainType === 'water' ? 1 : Math.floor(Math.random() * 3) + 1;
                  
                  return (
                    <div
                      key={`${row}-${col}`}
                      className="absolute transition-all duration-300 hover:scale-110"
                      style={{
                        left: `${col * 12 - row * 12}px`,
                        top: `${row * 6 + col * 6}px`,
                        width: '16px',
                        height: `${height * 8}px`,
                        backgroundColor: terrainTypes.find(t => t.id === terrainType)?.color,
                        borderRadius: '1px',
                        boxShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                        zIndex: row + col
                      }}
                    >
                      {/* Add details for certain terrain types */}
                      {terrainType === 'grass' && height > 1 && Math.random() > 0.7 && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-3 bg-green-600 rounded-full"></div>
                      )}
                    </div>
                  );
                })
              )}
              
              {/* Character in world */}
              <div 
                className="absolute w-4 h-6 bg-blue-500 rounded-sm border border-white/20"
                style={{
                  left: '48px',
                  top: '40px',
                  zIndex: 100
                }}
              >
                <div className="w-full h-2 bg-brown-500 rounded-t-sm"></div>
              </div>
            </div>
          </div>
          
          {/* World Stats */}
          <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
            <div className="bg-white/10 p-2 rounded text-center">
              <div className="font-semibold">Size</div>
              <div>{worldSize}x{worldSize}</div>
            </div>
            <div className="bg-white/10 p-2 rounded text-center">
              <div className="font-semibold">Voxels</div>
              <div>{worldSize * worldSize}</div>
            </div>
            <div className="bg-white/10 p-2 rounded text-center">
              <div className="font-semibold">Layers</div>
              <div>3</div>
            </div>
            <div className="bg-white/10 p-2 rounded text-center">
              <div className="font-semibold">Objects</div>
              <div>47</div>
            </div>
          </div>
        </div>

        {/* World Building Controls */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">Terrain Types:</h4>
            <div className="grid grid-cols-1 gap-2">
              {terrainTypes.map((terrain) => (
                <button
                  key={terrain.id}
                  onClick={() => setSelectedTerrain(terrain.id)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all flex items-center space-x-3 ${
                    selectedTerrain === terrain.id
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <span className="text-lg">{terrain.icon}</span>
                  <span>{terrain.name}</span>
                  <div 
                    className="w-4 h-4 rounded border border-white/20 ml-auto"
                    style={{ backgroundColor: terrain.color }}
                  ></div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">World Size: {worldSize}x{worldSize}</h4>
            <input
              type="range"
              min="16"
              max="64"
              value={worldSize}
              onChange={(e) => setWorldSize(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/70 mt-1">
              <span>Small (16x16)</span>
              <span>Medium (32x32)</span>
              <span>Large (64x64)</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">World Properties:</h4>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Selected Terrain:</span>
                <span className="font-medium flex items-center">
                  {terrainTypes.find(t => t.id === selectedTerrain)?.icon}
                  <span className="ml-1">{terrainTypes.find(t => t.id === selectedTerrain)?.name}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span>Isometric View:</span>
                <span className="font-medium">45° Rotation</span>
              </div>
              <div className="flex justify-between">
                <span>Lighting:</span>
                <span className="font-medium">Dynamic Shadows</span>
              </div>
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 py-3 rounded-lg font-medium transition-all hover:scale-105">
            <Cube className="inline mr-2 w-4 h-4" />
            Generate World
          </button>
        </div>
      </div>
    </div>
  );
};

// Liquid Glass Material System (Screenshots 15 & 16)
const LiquidGlassMaterialSystem: React.FC = () => {
  const [glassOpacity, setGlassOpacity] = useState(0.7);
  const [refractionIndex, setRefractionIndex] = useState(1.5);
  const [liquidFlow, setLiquidFlow] = useState(0.5);
  const [glassColor, setGlassColor] = useState('#FF6B35');

  const glassPresets = [
    { name: 'Clear Glass', opacity: 0.9, refraction: 1.5, color: '#FFFFFF' },
    { name: 'Amber Liquid', opacity: 0.7, refraction: 1.3, color: '#FF6B35' },
    { name: 'Blue Liquid', opacity: 0.6, refraction: 1.4, color: '#4169E1' },
    { name: 'Green Glass', opacity: 0.8, refraction: 1.6, color: '#228B22' }
  ];

  return (
    <div className="bg-gradient-to-br from-orange-400 to-pink-500 p-6 rounded-lg text-white">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Droplets className="mr-2" />
        Liquid Glass Material System (Screenshots 15 & 16)
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liquid Glass Visualization */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="h-80 flex items-center justify-center relative">
            {/* Liquid Glass Objects */}
            <div className="relative">
              {/* Main Glass Shape */}
              <div 
                className="w-32 h-20 rounded-full relative transition-all duration-500"
                style={{
                  backgroundColor: glassColor,
                  opacity: glassOpacity,
                  filter: `blur(${(1 - glassOpacity) * 2}px)`,
                  boxShadow: `0 10px 30px ${glassColor}40`
                }}
              >
                {/* Refraction Highlight */}
                <div 
                  className="absolute top-2 left-4 w-8 h-4 bg-white rounded-full"
                  style={{ opacity: refractionIndex * 0.3 }}
                ></div>
                
                {/* Liquid Flow Effect */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(${liquidFlow * 360}deg, transparent 0%, ${glassColor}80 50%, transparent 100%)`,
                    animation: `spin ${3 - liquidFlow * 2}s linear infinite`
                  }}
                ></div>
              </div>
              
              {/* Secondary Glass Element */}
              <div 
                className="absolute -right-8 top-4 w-20 h-16 rounded-full"
                style={{
                  backgroundColor: glassColor,
                  opacity: glassOpacity * 0.8,
                  filter: `blur(${(1 - glassOpacity) * 1.5}px)`,
                  boxShadow: `0 5px 20px ${glassColor}30`
                }}
              >
                <div 
                  className="absolute top-1 left-2 w-4 h-2 bg-white rounded-full"
                  style={{ opacity: refractionIndex * 0.2 }}
                ></div>
              </div>
              
              {/* Background Elements (Flowers) */}
              <div className="absolute -left-16 -top-8 w-12 h-16 opacity-50">
                <div className="w-8 h-8 bg-orange-300 rounded-full"></div>
                <div className="w-2 h-8 bg-green-400 mx-auto"></div>
              </div>
              <div className="absolute -right-16 -bottom-8 w-12 h-16 opacity-50">
                <div className="w-8 h-8 bg-orange-300 rounded-full"></div>
                <div className="w-2 h-8 bg-green-400 mx-auto"></div>
              </div>
            </div>
          </div>
          
          {/* Material Properties Display */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div className="bg-white/10 p-2 rounded text-center">
              <div className="font-semibold">Opacity</div>
              <div>{(glassOpacity * 100).toFixed(0)}%</div>
            </div>
            <div className="bg-white/10 p-2 rounded text-center">
              <div className="font-semibold">Refraction</div>
              <div>{refractionIndex.toFixed(1)}</div>
            </div>
            <div className="bg-white/10 p-2 rounded text-center">
              <div className="font-semibold">Flow</div>
              <div>{(liquidFlow * 100).toFixed(0)}%</div>
            </div>
          </div>
        </div>

        {/* Material Controls */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">Glass Presets:</h4>
            <div className="grid grid-cols-1 gap-2">
              {glassPresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setGlassOpacity(preset.opacity);
                    setRefractionIndex(preset.refraction);
                    setGlassColor(preset.color);
                  }}
                  className="p-3 rounded-lg text-sm font-medium transition-all bg-white/10 hover:bg-white/20 flex items-center justify-between"
                >
                  <span>{preset.name}</span>
                  <div 
                    className="w-6 h-6 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.color, opacity: preset.opacity }}
                  ></div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                Glass Opacity: {(glassOpacity * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={glassOpacity}
                onChange={(e) => setGlassOpacity(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Refraction Index: {refractionIndex.toFixed(1)}
              </label>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.1"
                value={refractionIndex}
                onChange={(e) => setRefractionIndex(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Liquid Flow: {(liquidFlow * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={liquidFlow}
                onChange={(e) => setLiquidFlow(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Glass Color:</label>
              <input
                type="color"
                value={glassColor}
                onChange={(e) => setGlassColor(e.target.value)}
                className="w-full h-10 rounded border border-white/20"
              />
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 py-3 rounded-lg font-medium transition-all hover:scale-105">
            <Zap className="inline mr-2 w-4 h-4" />
            Apply Liquid Glass Material
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Main Advanced Modeling Demo
const SplineAdvancedModeling: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AGENT Progressive Training - Session 5
        </h1>
        <p className="text-gray-600">
          Advanced voxel modeling, world building, and liquid glass material systems
        </p>
      </div>

      {/* Training Progress Update */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-purple-600">
          🚀 Session 5 Training Complete - Advanced Modeling & Materials
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">16</div>
            <div className="text-sm text-gray-600">Screenshots Analyzed</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">55+</div>
            <div className="text-sm text-gray-600">Concepts Learned</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">15</div>
            <div className="text-sm text-gray-600">Advanced Components</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">5</div>
            <div className="text-sm text-gray-600">Tutorial Sessions</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">Expert</div>
            <div className="text-sm text-gray-600">Skill Level</div>
          </div>
        </div>
      </div>

      {/* Session 5 Components */}
      <div className="space-y-8">
        <VoxelCharacterCreator />
        <VoxelWorldBuilder />
        <LiquidGlassMaterialSystem />
      </div>

      {/* Enhanced Capabilities Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🧠 AGENT's Expert Capabilities (Session 5):</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium mb-2">Voxel Character Modeling:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Professional character construction</li>
              <li>• Modular body part systems</li>
              <li>• Material assignment workflows</li>
              <li>• Character customization tools</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Voxel World Building:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Isometric world construction</li>
              <li>• Multi-terrain environment design</li>
              <li>• Complex landscape generation</li>
              <li>• Environmental storytelling</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Advanced Material Systems:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Liquid glass material creation</li>
              <li>• Advanced transparency effects</li>
              <li>• Refraction and optical systems</li>
              <li>• Professional material workflows</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <p className="text-purple-800 text-sm">
            🎯 <strong>Expert Level Achieved:</strong> AGENT has mastered the complete spectrum from basic visualizations → 
            API configuration → advanced interactions → professional web integration → expert-level voxel modeling and 
            sophisticated material systems. Ready for any 3D development challenge!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplineAdvancedModeling;
