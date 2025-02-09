import { useState } from 'react'
import { Box, BoxHeader, Button } from '@pexip/components'
import { useNavigate } from 'react-router-dom'
import { config } from '../config'

import './CreateMeeting.css'

interface CreateMeetingProps {
  playerColour: string;
  setPlayerColour: (color: string) => void;
}

export const CreateMeeting = ({ playerColour, setPlayerColour }: CreateMeetingProps): JSX.Element => {
  const navigate = useNavigate()
  const [meetingCode, setMeetingCode] = useState<string>(''); // State for meeting code

  const handleCreateClick = async (): Promise<void> => {
    const url = config.server;
    try {
      const response = await fetch(`${url}/meetings`, {
        method: 'POST'
      });
      const data = await response.json();
      navigate(`/meetings/${data.id}`);
    } catch (e) {
      console.error('Cannot create the meeting', e);
    }
  };

  const handleJoinClick = (): void => {
    if (meetingCode.trim() !== '') {
      navigate(`/meetings/${meetingCode}`);
    } else {
      console.error('Meeting code is required');
    }
  };

  return (
    <div className="CreateMeeting">
      <div className="lobby">
        <h1>PexipPlay 🤜🤛</h1>
      </div>
      <Box colorScheme="light">
        <BoxHeader>
          <h3>Welcome to the Lobby</h3>
        </BoxHeader>
        <div className="BoxContainer">
            {/* player color */}
            <label htmlFor="playerColor">Choose your player color:</label><br />
            <div className="color-buttons">
            <button
              style={{ backgroundColor: 'red', borderRadius: '50%', width: '30px', height: '30px' }}
              onClick={() => setPlayerColour('red')}
            >
            </button>
            <button
              style={{ backgroundColor: 'blue', borderRadius: '50%', width: '30px', height: '30px' }}
              onClick={() => setPlayerColour('blue')}
            >
            </button>
            <button
              style={{ backgroundColor: 'yellow', borderRadius: '50%', width: '30px', height: '30px' }}
              onClick={() => setPlayerColour('yellow')}
            >
            </button>
            <button
              style={{ backgroundColor: 'green', borderRadius: '50%', width: '30px', height: '30px' }}
              onClick={() => setPlayerColour('green')}
            >
            </button>
            </div>
            <br />
            <p>Chosen color: {playerColour || 'red'}</p>

          <div className="JoinContainer">
          <input
            type="text"
            placeholder="Enter meeting code"
            value={meetingCode}
            onChange={(e) => setMeetingCode(e.target.value)} // Update state on input change
          />
          <Button
            variant="primary"
            colorScheme="light"
            onClick={handleJoinClick}
          >
            Join
          </Button>
        </div>

          <br />
            <p>
            Click on <b>Create Game</b> and share link with other players.
            </p>
          <Button
            variant="primary"
            colorScheme="light"
            onClick={() => {
              console.log(`Player color selected: ${playerColour}`);
              handleCreateClick().catch((e) => {
                console.error(e)
              })
            }}
          >
            Create Game
          </Button>
        </div>
      </Box>
    </div>
  )
}
