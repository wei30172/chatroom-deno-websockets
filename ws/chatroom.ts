import {
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  WebSocket,
} from "https://deno.land/std@0.115.1/ws/mod.ts";

import { v4 } from "https://deno.land/std@0.115.1/uuid/mod.ts";

let sockets = new Map<string, WebSocket>();

interface BroadcastObj {
  name: string,
  mssg: string,
}

// broadcast events to clients
const broadcastEvent = (obj: BroadcastObj) => {
  sockets.forEach((ws: WebSocket) => {
    ws.send(JSON.stringify(obj));
  });
}

const handleWs = async(ws: WebSocket) => {
  console.log("socket connected!");

  // add new ws connection to map
  const uid: string = v4.generate();
  sockets.set(uid, ws);

  try {
    for await (const ev of ws) {
      // console.log(ev);
      // close
      if (isWebSocketCloseEvent(ev)) {
        sockets.delete(uid)
      }
      // text message
      if (typeof ev === "string") {
        let evObj = JSON.parse(ev);
        broadcastEvent(evObj);
      }
    }
  } catch (err) {
    console.error(`failed to receive frame: ${err}`);
    if (!ws.isClosed) {
      await ws.close(1000).catch(console.error);
    }
  }
}

export { handleWs }