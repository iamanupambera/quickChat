import WebSocket from "ws";
import { RedisService } from "./redisConnection";

export default class UserService {
  private static instance: UserService;
  private userSubscriptions: Map<WebSocket, Set<string>> = new Map();
  private channels: Map<string, Set<WebSocket>> = new Map();
  private redisService: RedisService = RedisService.getInstance();

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public addUser(ws: WebSocket): void {
    if (!this.userSubscriptions.has(ws)) {
      this.userSubscriptions.set(ws, new Set());
    }

    // warning for exist max connection
    // get another instance of websocket
    if (this.userSubscriptions.size === 5) {
      console.error({ time: new Date(), userNo: this.userSubscriptions.size });
    }
  }

  public async removeUser(ws: WebSocket): Promise<void> {
    if (!this.userSubscriptions.has(ws)) return;

    const channels = this.userSubscriptions.get(ws)!;
    for (const channel of channels) {
      const channelUsers = this.channels.get(channel);
      if (channelUsers) {
        channelUsers.delete(ws);
        // If no users remain on the channel, unsubscribe from Redis.
        if (channelUsers.size === 0) {
          await this.unsubscribeChannel(channel);
          this.channels.delete(channel);
        }
      }
    }

    // Finally, remove the user from the userSubscriptions map.
    this.userSubscriptions.delete(ws);
  }

  /**
   * Subscribe a user (WebSocket connection) to a specific channel.
   * If the channel is new, subscribe to it on Redis as well.
   *
   * @param ws - The WebSocket connection.
   * @param channel - The channel name (for example, a conversation ID).
   */
  public async subscribeUserToChannel(
    ws: WebSocket,
    channel: string
  ): Promise<void> {
    if (!this.userSubscriptions.has(ws)) {
      this.userSubscriptions.set(ws, new Set());
    }
    this.userSubscriptions.get(ws)!.add(channel);

    // Add the user to the channel's set.
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
      // Subscribe to the Redis channel if it's new.
      await this.redisService.subscribe(channel, (message: string) => {
        this.broadcastToChannel(channel, message);
      });
    }
    this.channels.get(channel)!.add(ws);
  }

  /**
   * Unsubscribe a user (WebSocket connection) from a specific channel.
   * If the channel becomes empty, unsubscribe from Redis.
   *
   * @param ws - The WebSocket connection.
   * @param channel - The channel name.
   */
  public async unsubscribeUserFromChannel(
    ws: WebSocket,
    channel: string
  ): Promise<void> {
    // Remove channel from the user's subscription list.
    if (this.userSubscriptions.has(ws)) {
      this.userSubscriptions.get(ws)!.delete(channel);
    }

    // Remove the user from the channel's set.
    const channelUsers = this.channels.get(channel);
    if (channelUsers) {
      channelUsers.delete(ws);
      if (channelUsers.size === 0) {
        await this.unsubscribeChannel(channel);
        this.channels.delete(channel);
      }
    }
  }

  /**
   * Change a user's channel subscription from one channel to another.
   *
   * @param ws - The WebSocket connection.
   * @param oldChannel - The channel to unsubscribe from.
   * @param newChannel - The channel to subscribe to.
   */
  public async changeUserChannel(
    ws: WebSocket,
    oldChannel: string,
    newChannel: string
  ): Promise<void> {
    await this.unsubscribeUserFromChannel(ws, oldChannel);
    await this.subscribeUserToChannel(ws, newChannel);
  }

  private async unsubscribeChannel(channel: string): Promise<void> {
    try {
      await this.redisService.unsubscribe(channel);
      console.log(`Unsubscribed from Redis channel: ${channel}`);
    } catch (error) {
      console.error(`Error unsubscribing from channel ${channel}:`, error);
    }
  }

  /**
   * Broadcast a message to all WebSocket clients subscribed to a given channel.
   *
   * @param channel - The channel to broadcast to.
   * @param message - The message to send.
   */
  private broadcastToChannel(channel: string, message: string): void {
    const channelUsers = this.channels.get(channel);
    if (channelUsers) {
      for (const ws of channelUsers) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      }
    }
  }
}
