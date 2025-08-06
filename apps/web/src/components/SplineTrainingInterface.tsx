import React, { useState, useRef } from 'react';
import { Upload, Camera, Code, Play, BookOpen, Zap } from 'lucide-react';

interface TrainingSession {
  session_id: string;
  session_name: string;
  notes_processed: number;
  screenshots_analyzed: number;
  scenes_generated: number;
  concepts_learned: string[];
}

interface SplineScene {
  name: string;
  elements: any[];
  lighting: any;
  camera_settings: any;
  animations: any[];
  interactions: any[];
}

const SplineTrainingInterface: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [notes, setNotes] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [generatedScene, setGeneratedScene] = useState<SplineScene | null>(null);
  const [sceneDescription, setSceneDescription] = useState('');
  const [trainingProgress, setTrainingProgress] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startTrainingSession = async () => {
    setIsTraining(true);
    try {
      const response = await fetch('/api/agent/spline/start-training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_name: `Spline Course ${new Date().toLocaleDateString()}`,
          course_module: 'Interactive 3D Development'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setCurrentSession({
          session_id: result.session_id,
          session_name: result.session_name || 'Spline Training',
          notes_processed: 0,
          screenshots_analyzed: 0,
          scenes_generated: 0,
          concepts_learned: []
        });
      }
    } catch (error) {
      console.error('Error starting training session:', error);
    }
    setIsTraining(false);
  };

  const processNotes = async () => {
    if (!notes.trim() || !currentSession) return;
    
    setIsTraining(true);
    try {
      const response = await fetch('/api/agent/spline/process-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          lesson_title: lessonTitle,
          context: 'Spline 3D development course'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setCurrentSession(prev => prev ? {
          ...prev,
          notes_processed: prev.notes_processed + 1,
          concepts_learned: [...prev.concepts_learned, ...result.new_techniques]
        } : null);
        setNotes('');
        setLessonTitle('');
      }
    } catch (error) {
      console.error('Error processing notes:', error);
    }
    setIsTraining(false);
  };

  const handleScreenshotUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentSession) return;

    setIsTraining(true);
    const formData = new FormData();
    formData.append('screenshot', file);
    formData.append('description', 'Spline 3D scene screenshot');
    formData.append('lesson_context', 'Course material analysis');

    try {
      const response = await fetch('/api/agent/spline/analyze-screenshot', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      if (result.success) {
        setCurrentSession(prev => prev ? {
          ...prev,
          screenshots_analyzed: prev.screenshots_analyzed + 1
        } : null);
      }
    } catch (error) {
      console.error('Error analyzing screenshot:', error);
    }
    setIsTraining(false);
  };

  const generateScene = async () => {
    if (!sceneDescription.trim() || !currentSession) return;
    
    setIsTraining(true);
    try {
      const response = await fetch('/api/agent/spline/generate-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene_description: sceneDescription,
          apply_concepts: currentSession.concepts_learned.slice(0, 3),
          style: 'modern'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setGeneratedScene(result.scene);
        setCurrentSession(prev => prev ? {
          ...prev,
          scenes_generated: prev.scenes_generated + 1
        } : null);
        setSceneDescription('');
      }
    } catch (error) {
      console.error('Error generating scene:', error);
    }
    setIsTraining(false);
  };

  const getTrainingProgress = async () => {
    try {
      const response = await fetch('/api/agent/spline/training-progress');
      const result = await response.json();
      setTrainingProgress(result);
    } catch (error) {
      console.error('Error getting training progress:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AGENT Spline 3D Training Interface
        </h1>
        <p className="text-gray-600">
          Train AGENT to develop immersive 3D experiences using course notes and screenshots
        </p>
      </div>

      {/* Training Session Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Zap className="mr-2 text-blue-500" />
            Training Session
          </h2>
          {!currentSession ? (
            <button
              onClick={startTrainingSession}
              disabled={isTraining}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
            >
              <Play className="mr-2 w-4 h-4" />
              Start Training
            </button>
          ) : (
            <button
              onClick={getTrainingProgress}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              View Progress
            </button>
          )}
        </div>

        {currentSession && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{currentSession.notes_processed}</div>
              <div className="text-sm text-gray-600">Notes Processed</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{currentSession.screenshots_analyzed}</div>
              <div className="text-sm text-gray-600">Screenshots Analyzed</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{currentSession.scenes_generated}</div>
              <div className="text-sm text-gray-600">Scenes Generated</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{currentSession.concepts_learned.length}</div>
              <div className="text-sm text-gray-600">Concepts Learned</div>
            </div>
          </div>
        )}
      </div>

      {currentSession && (
        <>
          {/* Course Notes Processing */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BookOpen className="mr-2 text-green-500" />
              Process Course Notes
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Lesson title (e.g., 'Introduction to 3D Lighting')"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea
                placeholder="Paste your Spline course notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={processNotes}
                disabled={!notes.trim() || isTraining}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
              >
                Process Notes
              </button>
            </div>
          </div>

          {/* Screenshot Analysis */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Camera className="mr-2 text-blue-500" />
              Analyze Screenshots
            </h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleScreenshotUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isTraining}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center mx-auto disabled:opacity-50"
              >
                <Upload className="mr-2 w-5 h-5" />
                Upload Spline Screenshot
              </button>
              <p className="text-gray-500 mt-2">
                Upload screenshots from your Spline course to analyze 3D scenes
              </p>
            </div>
          </div>

          {/* Scene Generation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Code className="mr-2 text-purple-500" />
              Generate 3D Scene
            </h2>
            <div className="space-y-4">
              <textarea
                placeholder="Describe the 3D scene you want to create (e.g., 'A modern product showcase with floating geometric shapes and dynamic lighting')"
                value={sceneDescription}
                onChange={(e) => setSceneDescription(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={generateScene}
                disabled={!sceneDescription.trim() || isTraining}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
              >
                Generate Scene
              </button>
            </div>

            {generatedScene && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Generated Scene: {generatedScene.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Elements:</strong> {generatedScene.elements.length}
                  </div>
                  <div>
                    <strong>Animations:</strong> {generatedScene.animations.length}
                  </div>
                  <div>
                    <strong>Interactions:</strong> {generatedScene.interactions.length}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Training Progress */}
          {trainingProgress && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Training Progress</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Capabilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(trainingProgress.capabilities).map(([key, value]) => (
                      value === true && (
                        <span key={key} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          {key.replace(/_/g, ' ')}
                        </span>
                      )
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Knowledge Categories</h3>
                  <div className="text-sm text-gray-600">
                    {trainingProgress.training_stats.knowledge_categories} categories learned
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SplineTrainingInterface;
