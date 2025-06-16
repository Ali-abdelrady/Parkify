import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import MQTTService, { MQTTConnectionStatus } from "@/lib/mqtt";
import MessageDisplay from "./MessageDisplay";
import QRCodeDisplay from "./QRCodeDisplay";

function GarageDisplay({ TOPICS }) {
  const [message, setMessage] = useState<string>("Parkify Exit Gate ;)");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<MQTTConnectionStatus>("disconnected");
  const [availableSpots, setAvailableSpots] = useState<string | null>(null);
  const { toast } = useToast();
  const [mqttService, setMqttService] = useState<MQTTService | null>(null);

  // Initialize MQTT service
  useEffect(() => {
    const service = new MQTTService({
      onConnect: () => {
        setConnectionStatus("connected");
        toast({
          title: "Connected to MQTT",
          description: "Successfully connected to the garage system.",
        });
      },
      onDisconnect: () => {
        setConnectionStatus("disconnected");
        toast({
          title: "Disconnected",
          description: "Lost connection to the garage system.",
          variant: "destructive",
        });
      },
      onMessage: (topic, messageContent) => {
        console.log(`Received on ${topic}: ${messageContent[0]}`);

        if (topic === TOPICS.MESSAGE) {
          setMessage(messageContent || "Parkify Exit Gate ;)");
        } else if (topic === TOPICS.QR_CODE) {
          if (messageContent && messageContent.trim() !== "") {
            setQrCodeUrl(messageContent);
          } else {
            setQrCodeUrl(null);
          }
        } else if (topic === TOPICS.AVAILABLE_SPOTS) {
          try {
            setAvailableSpots(
              `Public: ${messageContent[0]} - Reservable: ${messageContent[2]}`
            );
          } catch (e) {
            console.error("Invalid available spots value:", messageContent);
          }
        }
      },
      onError: (error) => {
        console.error("MQTT Error:", error);
        toast({
          title: "Connection Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });

    setMqttService(service);
    service.connect();
    return () => {
      service.disconnect();
    };
  }, [toast]);
  useEffect(() => {
    if (qrCodeUrl) {
      const timer = setTimeout(() => {
        setQrCodeUrl(null);
      }, 10000); // 15 seconds

      return () => clearTimeout(timer); // Clean up the timer on re-renders
    }
  }, [qrCodeUrl]);
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("Parkify Exit Gate ;)");
      }, 5000); // 15 seconds

      return () => clearTimeout(timer); // Clean up the timer on re-renders
    }
  }, [message]);
  const getStatusBadgeClass = () => {
    switch (connectionStatus) {
      case "connected":
        return "status-badge status-connected";
      case "disconnected":
        return "status-badge status-disconnected";
      case "connecting":
        return "status-badge status-connecting";
      default:
        return "status-badge";
    }
  };

  const reconnect = () => {
    if (mqttService && connectionStatus === "disconnected") {
      mqttService.connect();
      setConnectionStatus("connecting");
    }
  };

  return (
    <div className="garage-display">
      <div className="mb-1 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">Parkify</h1>
        <p className="text-muted-foreground">Smart Garage Exit Display</p>
      </div>

      {qrCodeUrl ? (
        <QRCodeDisplay qrCodeUrl={qrCodeUrl} />
      ) : (
        <MessageDisplay message={message} />
      )}

      <div className="mt-3 flex flex-col items-center">
        <div className={getStatusBadgeClass()}>
          {connectionStatus === "connected"
            ? "Connected"
            : connectionStatus === "connecting"
            ? "Connecting..."
            : "Disconnected"}
        </div>

        {connectionStatus === "disconnected" && (
          <button
            onClick={reconnect}
            className="mt-4 px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors"
          >
            Reconnect
          </button>
        )}

        {availableSpots !== null && (
          <div className="mt-4 text-sm text-muted-foreground">
            Available Parking Spots: {availableSpots}
          </div>
        )}
      </div>
    </div>
  );
}

export default GarageDisplay;
