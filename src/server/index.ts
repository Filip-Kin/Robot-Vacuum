import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { createContext, t } from './trpc';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';
import { robotRouter } from './routers/robot-controller';
import express from 'express';
import proxy from 'express-http-proxy';
import httpProxy from 'http-proxy';
import { createServer } from 'http';

const PORT = parseInt(process.env.PORT ?? '3000');

export const appRouter = t.router({
    robot: robotRouter,
});

export type AppRouter = typeof appRouter;

createHTTPServer({
    router: appRouter,
    createContext,
}).listen(PORT + 1);

const wss = new WebSocketServer({
    port: PORT + 2,
});

const handler = applyWSSHandler({
    wss,
    router: appRouter,
    createContext
});

wss.on('connection', (ws) => {
    console.log(`++ Connection (${wss.clients.size})`);
    ws.once('close', () => {
        console.log(`-- Connection (${wss.clients.size})`);
    });
});
console.log('✅ WebSocket Server listening on ws://localhost:' + (PORT + 2) + '/');


const app = express();

const server = createServer(app);

const wsProxy = httpProxy.createProxyServer({ target: 'http://localhost:' + (PORT + 2), ws: true });

server.on('upgrade', function (req, socket, head) {
    wsProxy.ws(req, socket, head);
});

app.use('/trpc', proxy('http://localhost:' + (PORT + 1)));

server.listen(PORT);

process.on('SIGTERM', () => {
    console.log('SIGTERM');
    handler.broadcastReconnectNotification();
    wss.close();
});