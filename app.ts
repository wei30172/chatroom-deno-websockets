import { serve } from "https://deno.land/std@0.115.1/http/server_legacy.ts";
import { parse } from "https://deno.land/std@0.115.1/flags/mod.ts";
import { acceptWebSocket } from "https://deno.land/std@0.115.1/ws/mod.ts";
import { handleWs } from "./ws/chatroom.ts"

const { args } = Deno;
const DEFAULT_PORT = 8000;
const argPort = parse(args).port;

const server = serve({ port: argPort ? Number(argPort) : DEFAULT_PORT });

for await (const req of server) {
  if (req.url === '/') {
    req.respond({
      status: 200,
      body: await Deno.open('./public/index.html')
    });
  }

  // accept websocket connection
  if (req.url === '/ws') {
    const { conn, r: bufReader, w: bufWriter, headers } = req;
    acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    })
    .then(handleWs)
    .catch(async (err) => {
      console.error(`failed to accept websocket: ${err}`);
      await req.respond({ status: 400 });
    });
  }
}