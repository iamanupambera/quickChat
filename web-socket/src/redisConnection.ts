// src/RedisService.ts
import { createClient, RedisClientType } from "redis";
import { EventEmitter } from "events";

export class RedisService extends EventEmitter {
  private static instance: RedisService;
  private publisherClient: RedisClientType;
  private subscriberClient: RedisClientType | null = null;

  private constructor() {
    super();
    this.publisherClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });
    this.publisherClient.on("error", (err) =>
      console.error("Redis Publisher Error", err)
    );

    // Connect the publisher client
    this.publisherClient
      .connect()
      .catch((err) => console.error("Error connecting Redis publisher", err));
  }

  // Get the singleton instance of RedisService
  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  /**
   * Publish a message to a given channel.
   * @param channel The channel name
   * @param message The message to publish (stringified JSON is recommended)
   */
  public async publish(channel: string, message: string): Promise<void> {
    try {
      await this.publisherClient.publish(channel, message);
    } catch (error) {
      console.error(`Error publishing to channel ${channel}:`, error);
    }
  }

  /**
   * Subscribe to a given channel and set a callback for incoming messages.
   * This method creates a dedicated subscriber client if it does not exist.
   * @param channel The channel to subscribe to
   * @param callback A callback function that is invoked with the message as a parameter
   */
  public async subscribe(
    channel: string,
    callback: (message: string) => void
  ): Promise<void> {
    try {
      // Create a subscriber client if it doesn't exist
      if (!this.subscriberClient) {
        // Duplicate the publisher connection for subscription usage
        this.subscriberClient = this.publisherClient.duplicate();
        this.subscriberClient.on("error", (err) =>
          console.error("Redis Subscriber Error", err)
        );
        await this.subscriberClient.connect();
      }

      await this.subscriberClient.subscribe(channel, (message) => {
        callback(message);
      });
    } catch (error) {
      console.error(`Error subscribing to channel ${channel}:`, error);
    }
  }

  /**
   * Unsubscribe from a given channel.
   * @param channel The channel to unsubscribe from
   */
  public async unsubscribe(channel: string): Promise<void> {
    try {
      if (!this.subscriberClient) {
        console.warn(
          `No subscriber client exists to unsubscribe from channel ${channel}.`
        );
        return;
      }
      // Unsubscribe from the channel. This removes all callbacks for that channel.
      await this.subscriberClient.unsubscribe(channel);
      console.log(`Successfully unsubscribed from channel ${channel}`);
    } catch (error) {
      console.error(`Error unsubscribing from channel ${channel}:`, error);
    }
  }
}
