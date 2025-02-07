import "dotenv/config";
import WebSocket, { WebSocketServer } from "ws";
import UserService from "./userService";
import { handleWebSocketMessage } from "./handleWebSocketMessage";
import { createServer } from "http";
import { JwtPayload, verify } from "jsonwebtoken";
import { parse } from "url";

const port = +(process.env.PORT || "8080");
const jwtSecret = process.env.JWT_SECRET || "this is JWT_SECRET for login";

const server = createServer();
const wss = new WebSocketServer({ noServer: true });

const userService = UserService.getInstance();

server.on("upgrade", (req, socket, head) => {
  // Check for the Authorization header
  const { authHeader } = parse(req.url || "", true).query;

  if (
    !authHeader ||
    typeof authHeader !== "string" ||
    !authHeader.startsWith("Bearer ")
  ) {
    socket.write("HTTP/1.1 401 Forbidden\r\n\r\n");
    socket.destroy();
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verify(token, jwtSecret) as JwtPayload;
    if (!payload) {
      socket.write("HTTP/1.1 401 Forbidden\r\n\r\n");
      socket.destroy();
      return;
    }

    // If the token is valid, upgrade the connection.
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } catch (err) {
    socket.write("HTTP/1.1 401 Forbidden\r\n\r\n");
    socket.destroy();
  }
});

wss.on("connection", (ws: WebSocket) => {
  userService.addUser(ws);

  // handle websocket message logic
  ws.on("message", async (data: WebSocket.RawData) => {
    await handleWebSocketMessage(ws, data);
  });

  // Handle client disconnection.
  ws.on("close", async () => {
    await userService.removeUser(ws);
  });

  // Optionally handle errors.
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

server.listen(port, () => console.log(`Server started on port ${port}`));
