import React from 'react';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes
} from 'react-router-dom';
import { CreateMeeting } from './CreateMeeting/CreateMeeting';
import { Meeting } from './Meeting/Meeting';
import { GameOverScreen } from './GameOverScreen/GameOverScreen';

import './App.css';

export const App = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="*" element={<Navigate to={'/create-meeting'} />} />
          <Route path="/create-meeting" element={<CreateMeeting />} />
          <Route path="/meetings/:meetingId" element={<Meeting />} />
          <Route path="/game-over" element={<GameOverScreen winner />} /> {/* Example winner */}
        </Routes>
      </Router>
    </div>
  );
};