import { Client, Message } from "paho-mqtt";

// MQTT Broker Configuration
const BROKER_URL = "9bc5584a65f949e38d5b271a699d2084.s1.eu.hivemq.cloud";
const BROKER_PORT = 8884;
const USERNAME = "iotwebconnection";
const PASSWORD = "iotwebConnection1";
// MQTT Topics
export const LOCATIONS = {
  BANHA: {
    topics: {
      MESSAGE: `garage/banha/exit/display/message`,
      QR_CODE: `garage/banha/exit/display/qrcode`,
      AVAILABLE_SPOTS: `garage/banha/available_spots`,
    },
  },
  OBOUR: {
    topics: {
      MESSAGE: `garage/obour/exit/display/message`,
      QR_CODE: `garage/obour/exit/display/qrcode`,
      AVAILABLE_SPOTS: `garage/obour/available_spots`,
    },
  },
};
export type MQTTConnectionStatus = "connected" | "disconnected" | "connecting";

export interface MQTTProps {
  onConnect: () => void;
  onDisconnect: () => void;
  onMessage: (topic: string, message: string) => void;
  onError: (error: Error) => void;
}

export class MQTTService {
  private client: Client | null = null;
  private status: MQTTConnectionStatus = "disconnected";
  private callbacks: MQTTProps;

  constructor(callbacks: MQTTProps) {
    this.callbacks = callbacks;
  }

  get connectionStatus(): MQTTConnectionStatus {
    return this.status;
  }

  connect(): void {
    try {
      this.status = "connecting";
      const clientId = `garage_exit_display_${Math.random()
        .toString(16)
        .substr(2, 8)}`;
      this.client = new Client(BROKER_URL, BROKER_PORT, "/mqtt", clientId);

      // Set event callbacks
      this.client.onConnectionLost = this.onConnectionLost.bind(this);
      this.client.onMessageArrived = this.onMessageArrived.bind(this);

      const connectOptions = {
        useSSL: true,
        userName: USERNAME,
        password: PASSWORD,
        onSuccess: this.onConnectSuccess.bind(this),
        onFailure: this.onConnectFailure.bind(this),
      };

      console.log("Attempting to connect to MQTT broker...");
      this.client.connect(connectOptions);
    } catch (error) {
      console.error("Failed to initialize MQTT client:", error);
      this.status = "disconnected";
      this.callbacks.onError(
        error instanceof Error
          ? error
          : new Error("Unknown error during connection")
      );
    }
  }

  disconnect(): void {
    if (this.client && this.client.isConnected()) {
      this.client.disconnect();
      this.status = "disconnected";
      console.log("Disconnected from MQTT broker");
    }
  }

  subscribe(topic: string): void {
    if (this.client && this.client.isConnected()) {
      this.client.subscribe(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } else {
      console.warn("Cannot subscribe: MQTT client not connected");
    }
  }
  publish(topic: string, message: string): void {
    if (this.client && this.client.isConnected()) {
      const mqttMessage = new Message(message);
      mqttMessage.destinationName = topic;
      this.client.send(mqttMessage);
      console.log(`Published message to ${topic}: ${message}`);
    } else {
      console.warn("Cannot publish: MQTT client not connected");
    }
  }

  private onConnectSuccess(): void {
    console.log("Connected to MQTT broker successfully");
    this.status = "connected";
    this.callbacks.onConnect();

    // Subscribe to topics

    Object.values(LOCATIONS.BANHA.topics).forEach((topic) =>
      this.subscribe(topic)
    );
    Object.values(LOCATIONS.OBOUR.topics).forEach((topic) =>
      this.subscribe(topic)
    );
  }

  private onConnectFailure(error: any): void {
    console.error("Failed to connect to MQTT broker:", error);
    this.status = "disconnected";
    this.callbacks.onError(
      new Error(`Connection failed: ${error.errorMessage}`)
    );
  }

  private onConnectionLost(responseObject: any): void {
    if (responseObject.errorCode !== 0) {
      console.error("Connection lost:", responseObject.errorMessage);
      this.status = "disconnected";
      this.callbacks.onDisconnect();
    }
  }

  private onMessageArrived(message: Message): void {
    const payload = message.payloadString;
    console.log(`Message received on ${message.destinationName}: ${payload}`);
    this.callbacks.onMessage(message.destinationName, payload);
  }
}

export default MQTTService;
