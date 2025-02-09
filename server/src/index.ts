// import express, { type RequestHandler } from 'express'
// import helmet from 'helmet'
// import cors from 'cors'
// import fs from 'fs'
// import config from 'config'
// import { v4 as uuidv4 } from 'uuid'
// import jwt from 'jsonwebtoken'
// import { createApi, withToken } from '@pexip/vpaas-api'

// const host: string = config.get('server.host')
// const port: number = config.get('server.port')

// const app = express()
// app.use(helmet())

// const createJwt = (): string => {
//   const apiAddress: string = config.get('vpaas.apiAddress')
//   const authEndpoint = `${apiAddress}/oauth/token`
//   const clientId = config.get('vpaas.credentials.clientId')
//   const privateKey = fs.readFileSync(
//     config.get('vpaas.credentials.privateKeyPath')
//   )

//   const scope = [
//     'meeting:create',
//     'meeting:read',
//     'meeting:write',
//     'participant:create',
//     'participant:read',
//     'participant:write'
//   ]
//   const requestId = uuidv4()

//   const token = jwt.sign(
//     {
//       iss: clientId, // Application Client UUID
//       sub: clientId, // Application Client UUID
//       aud: authEndpoint,
//       scope: scope.join(' ')
//     },
//     privateKey,
//     {
//       algorithm: 'RS384',
//       expiresIn: '60s',
//       jwtid: requestId
//     }
//   )

//   return token
// }

// const api = withToken(createJwt, config.get('vpaas.apiAddress'))(createApi())

// app.use(
//   cors({
//     origin: `http://${host}:4000`  // client port
//   })
// )

// app.get('/api-address', (async (req, res) => {
//   res.send(config.get('vpaas.apiAddress'))
// }) as RequestHandler)

// app.post('/meetings', (async (req, res) => {
//   try {
//     const response = await api.create()
//     if (response.status === 200) {
//       return res.json(response.data)
//     } else {
//       return res.status(500).send('Cannot create the meeting')
//     }
//   } catch (error) {
//     return res.status(500).send('Cannot create the meeting')
//   }
// }) as RequestHandler)

// app.post('/meetings/:meetingId/participants', (async (req, res) => {
//   try {
//     const response = await api.participants({ meetingId: req.params.meetingId })
//     if (response.status === 200) {
//       return res.json(response.data)
//     } else {
//       return res.status(500).send(`Cannot get participants from the meeting`)
//     }
//   } catch (error) {
//     return res.status(500).send(`Cannot get participants from the meeting`)
//   }
// }) as RequestHandler)

// app.listen(port, host, () => {
//   console.log(
//     `VPaaS server listening on port ${port}: http://127.0.0.1:${port}`
//   )
// })

import express, { type RequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import fs from 'fs';
import config from 'config';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { createApi, withToken } from '@pexip/vpaas-api';
import http from 'http';
import { Server } from 'socket.io';

const host: string = config.get('server.host');
const port: number = config.get('server.port');

const app = express();
app.use(helmet());

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Store webcam frames and gestures for all clients
const clientData: Record<string, { frame: string | null; gesture: string | null; isLocal: boolean }> = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Initialize client data
  clientData[socket.id] = {
    frame: null,
    gesture: null,
    isLocal: false, // Default to false, set to true for the local vision system
  };

  // Handle local vision system connection
  socket.on('set_local', () => {
    clientData[socket.id].isLocal = true;
    console.log(`Client ${socket.id} is the local vision system.`);
  });

  // Receive video frames from clients
  socket.on('video_frame', (data: { frame: string }) => {
    clientData[socket.id].frame = data.frame;

    // Broadcast all frames to all clients
    const frames: Record<string, string> = {};
    for (const [id, data] of Object.entries(clientData)) {
      if (data.frame) {
        frames[id] = data.frame;
      }
    }
    io.emit('update_frames', frames);
  });

  // Receive gesture data from the local vision system
  socket.on('gesture_detected', (data: { gesture: string }) => {
    if (clientData[socket.id].isLocal) {
      clientData[socket.id].gesture = data.gesture;

      // Broadcast gestures to all clients
      const gestures: Record<string, string> = {};
      for (const [id, data] of Object.entries(clientData)) {
        if (data.isLocal && data.gesture) {
          gestures[id] = data.gesture;
        }
      }
      io.emit('update_gestures', gestures);
    }
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete clientData[socket.id];

    // Broadcast updated frames and gestures
    const frames: Record<string, string> = {};
    const gestures: Record<string, string> = {};
    for (const [id, data] of Object.entries(clientData)) {
      if (data.frame) {
        frames[id] = data.frame;
      }
      if (data.isLocal && data.gesture) {
        gestures[id] = data.gesture;
      }
    }
    io.emit('update_frames', frames);
    io.emit('update_gestures', gestures);
  });
});

// JWT creation and Pexip API setup
const createJwt = (): string => {
  const apiAddress: string = config.get('vpaas.apiAddress');
  const authEndpoint = `${apiAddress}/oauth/token`;
  const clientId = config.get('vpaas.credentials.clientId');
  const privateKey = fs.readFileSync(config.get('vpaas.credentials.privateKeyPath'));

  const scope = [
    'meeting:create',
    'meeting:read',
    'meeting:write',
    'participant:create',
    'participant:read',
    'participant:write',
  ];
  const requestId = uuidv4();

  const token = jwt.sign(
    {
      iss: clientId, // Application Client UUID
      sub: clientId, // Application Client UUID
      aud: authEndpoint,
      scope: scope.join(' '),
    },
    privateKey,
    {
      algorithm: 'RS384',
      expiresIn: '60s',
      jwtid: requestId,
    }
  );

  return token;
};

const api = withToken(createJwt, config.get('vpaas.apiAddress'))(createApi());

app.use(
  cors({
    origin: `http://${host}:4000`, // client port
  })
);

app.get('/api-address', (async (req, res) => {
  res.send(config.get('vpaas.apiAddress'));
}) as RequestHandler);

app.post('/meetings', (async (req, res) => {
  try {
    const response = await api.create();
    if (response.status === 200) {
      return res.json(response.data);
    } else {
      return res.status(500).send('Cannot create the meeting');
    }
  } catch (error) {
    return res.status(500).send('Cannot create the meeting');
  }
}) as RequestHandler);

app.post('/meetings/:meetingId/participants', (async (req, res) => {
  try {
    const response = await api.participants({ meetingId: req.params.meetingId });
    if (response.status === 200) {
      return res.json(response.data);
    } else {
      return res.status(500).send(`Cannot get participants from the meeting`);
    }
  } catch (error) {
    return res.status(500).send(`Cannot get participants from the meeting`);
  }
}) as RequestHandler);

// Start the server
server.listen(port, host, () => {
  console.log(`VPaaS server listening on port ${port}: http://127.0.0.1:${port}`);
});
