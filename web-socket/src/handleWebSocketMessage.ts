import WebSocket from "ws";
import { messageSchema, MessageType } from "./validation";
import UserService from "./userService";

export async function handleWebSocketMessage(
  ws: WebSocket,
  data: WebSocket.RawData
): Promise<void> {
  try {
    const message = JSON.parse(data.toString());
    const result = messageSchema.safeParse(message);

    if (!result.success) {
      ws.send(
        JSON.stringify({
          response: result.error,
          message: "Invalid message format",
        })
      );
      return;
    }

    const { action, payload } = message as MessageType;
    const userService = UserService.getInstance();

    // Handle different actions.
    switch (action) {
      case "subscribe": {
        // Here we assume that payload has a property called "channel".
        await userService.subscribeUserToChannel(ws, payload.channel);
        ws.send(
          JSON.stringify({
            status: "success",
            message: `Subscribed to ${payload.channel}`,
          })
        );
        break;
      }
      case "unsubscribe": {
        // Here we assume that payload has a property called "channel".
        await userService.unsubscribeUserFromChannel(ws, payload.channel);
        ws.send(
          JSON.stringify({
            status: "success",
            message: `Unsubscribed from ${payload.channel}`,
          })
        );
        break;
      }
      case "changeChannel": {
        // Here we assume that payload has properties "oldChannel" and "newChannel".
        await userService.changeUserChannel(
          ws,
          payload.oldChannel,
          payload.newChannel
        );
        ws.send(
          JSON.stringify({
            status: "success",
            message: `Changed channel from ${payload.oldChannel} to ${payload.newChannel}`,
          })
        );
        break;
      }
      default: {
        ws.send(
          JSON.stringify({
            status: "error",
            message: "Unknown action",
          })
        );
        break;
      }
    }
  } catch (error) {
    console.error("Error processing message from client:", error);
    ws.send(
      JSON.stringify({
        status: "error",
        message: "Invalid message format",
      })
    );
  }
}
