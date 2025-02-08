import { Box, BoxHeader, Button } from '@pexip/components'
import { useNavigate } from 'react-router-dom'
import { config } from '../config'

import './CreateMeeting.css'

export const CreateMeeting = (): JSX.Element => {
  const navigate = useNavigate()

  const handleClick = async (): Promise<void> => {
    const url = config.server
    try {
      const response = await fetch(`${url}/meetings`, {
        method: 'POST'
      })
      const data = await response.json()
      navigate(`/meetings/${data.id}`)
    } catch (e) {
      console.error('Cannot create the meeting')
    }
  }

  return (
    <div className="CreateMeeting">
      <Box colorScheme="light">
        <BoxHeader>
          <h3>Create Meeting</h3>
        </BoxHeader>
        <div className="BoxContainer">
          <p>
            Click on <b>Create Meeting</b> and share the link with other
            participants.
          </p>
          <Button
            variant="primary"
            colorScheme="light"
            onClick={() => {
              handleClick().catch((e) => {
                console.error(e)
              })
            }}
          >
            Create Meeting
          </Button>
        </div>
      </Box>
    </div>
  )
}
// import { useState } from 'react';
// import { PexRTC } from '@pexip/pexrtc';

// export const CreateMeeting = () => {
//   const [meetingId, setMeetingId] = useState("");

//   const startMeeting = () => {
//     const rtc = new PexRTC();
//     rtc.makeCall("your.pexip.server", meetingId, "guest");

//     // Replace default camera with processed video feed
//     rtc.setVideoSrc("http://your-server-ip:5001/video_feed");
//   };

//   return (
//     <div>
//       <h1>Create Meeting</h1>
//       <input
//         type="text"
//         value={meetingId}
//         onChange={(e) => setMeetingId(e.target.value)}
//         placeholder="Enter Meeting ID"
//       />
//       <button onClick={startMeeting}>Start Meeting</button>
//     </div>
//   );
// };
