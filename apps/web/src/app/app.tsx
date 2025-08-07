// React Router v6 app entry that wires Mobbin-inspired example pages.

// ... existing code ...
import Chat from './chat';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './dashboard';
import ListDetail from './list-detail';
import Settings from './settings';
import Auth from './auth';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/list-detail" element={<ListDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
// ... existing code ...
