import {useState, useEffect} from 'react';
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
      <div className="lobby">
        <h1>PexipPlay 🤜🤛</h1>
      </div>
      <Box colorScheme="light">
        <BoxHeader>
          <h3>Welcome to the Lobby</h3>
        </BoxHeader>
        <div className="BoxContainer">
          {/* player name */}
          <label htmlFor="playerName">Enter your name:</label>
          <input
          type="text"
          id="playerName"
          name="playerName"
          placeholder={`player${Math.floor(Math.random() * 1000)}`}
          onChange={(e) => setPlayerName(e.target.value)}
          />

          {/* enter shared url */}
          <label htmlFor="gameUrl">Enter game URL:</label>
          <input
            type="text"
            id="gameUrl"
            name="gameUrl"
            placeholder="https://example.com/meeting/123"
            onChange={(e) => setGameUrl(e.target.value)}
          />
          <Button
            variant="secondary"
            colorScheme="light"
            onClick={() => {
              if (gameUrl) {
                navigate(gameUrl)
              } else {
                console.error('No URL provided')
              }
            }}
          >
            Join Game
          </Button>
          {/* end of new changes */}


          <p>
            Click on <b>Create Game</b> and share link with other players.
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
            Create Game
          </Button>
        </div>
      </Box>
    </div>
  )
}
