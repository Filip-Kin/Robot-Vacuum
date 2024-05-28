import { createTRPCProxyClient, createWSClient, httpBatchLink, splitLink, wsLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../server';

const wsClient = createWSClient({
    url: `ws://localhost:3002/`,
});

export const trpc = createTRPCProxyClient<AppRouter>({
    links: [
        splitLink({
            condition: (op) => (op.type === 'subscription' || op.path === '/robot/joystick'),
            true: wsLink({ client: wsClient }),
            false: httpBatchLink({ url: '/trpc' }),
        }),
    ],
    transformer: superjson,
});
