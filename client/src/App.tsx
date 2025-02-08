import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes
} from 'react-router-dom';
import { CreateMeeting } from './CreateMeeting/CreateMeeting';
import { Meeting } from './Meeting/Meeting';
import { WebcamStream } from './WebcamStream';  // Import new component
import { WebcamPage } from './WebcamPage/WebcamPage'

import './App.css';

export const App = (): JSX.Element => {
  return (
      <div className="App">
          <Router>
              <Routes>
                  <Route path="*" element={<Navigate to={'/webcam-gesture'} />} />
                  <Route path="/create-meeting" element={<CreateMeeting />} />
                  <Route path="/meetings/:meetingId" element={<Meeting />} />
                  <Route path="/webcam" element={<WebcamStream />} />  {/* New route */}
                  <Route path="/webcam-gesture" element={<WebcamPage />} /> {/* Add route */}
              </Routes>
          </Router>
      </div>
  );
};
