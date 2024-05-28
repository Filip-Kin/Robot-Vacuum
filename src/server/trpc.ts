import { initTRPC, type inferAsyncReturnType } from '@trpc/server';
import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';
import type { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws';
import superjson from 'superjson';

// created for each request
export const createContext = (opts: CreateHTTPContextOptions | CreateWSSContextFnOptions) => ({}); // no context

type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create({ transformer: superjson });
