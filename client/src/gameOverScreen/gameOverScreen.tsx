import React from 'react';
import { Box, BoxHeader, Button } from '@pexip/components';
import { useNavigate, useLocation } from 'react-router-dom';

import './GameOverScreen.css';

export const GameOverScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { winner } = location.state || { winner: 1 }; // Default to 1 if no state

  const handleRestart = () => {
    navigate('/create-meeting');
  };

  return (
    <div className="GameOverScreen">
      <Box colorScheme="dark">
        <BoxHeader>
          <h3>Game Over</h3>
        </BoxHeader>
        <div className="BoxContainer">
          <p>Player {winner} wins!</p>
          <Button
            variant="primary"
            colorScheme="dark"
            onClick={handleRestart}
          >
            Restart Game
          </Button>
        </div>
      </Box>
    </div>
  );
};