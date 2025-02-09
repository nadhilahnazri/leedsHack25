import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes
  } from 'react-router-dom'
  import { CreateMeeting } from './CreateMeeting/CreateMeeting'
  import { Meeting } from './Meeting/Meeting'
  import { useState } from 'react'
  
  import './App.css'
  
  export const App = (): JSX.Element => {
    const [playerColour, setPlayerColour] = useState<string>(''); // Lift state up to parent component

    return (
      <div className="App">
        <Router>
          <Routes>
            <Route path="*" element={<Navigate to={'/create-meeting'} />} />
            <Route
              path="/create-meeting"
              element={<CreateMeeting playerColour={playerColour} setPlayerColour={setPlayerColour} />}
            />
            <Route
              path="/meetings/:meetingId"
              element={<Meeting playerColour={playerColour} />}
            />
          </Routes>
        </Router>
      </div>
    );
  }
  