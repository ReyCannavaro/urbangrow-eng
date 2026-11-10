import { simulator } from "./simulator";

export interface WebSocketClient {
  send: (data: string) => void;
  id: string;
}

export class TelemetryWebSocketManager {
  private static clients: Set<WebSocketClient> = new Set();
  private static heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private static broadcastInterval: ReturnType<typeof setInterval> | null = null;

  static addClient(client: WebSocketClient) {
    this.clients.add(client);
    console.log(`[WS-TELEMETRY] Client connected: ${client.id} (Total: ${this.clients.size})`);

    // Send immediate current snapshot
    client.send(JSON.stringify({ type: "snapshot", data: simulator.getSnapshot() }));

    if (!this.heartbeatInterval) {
      this.startHeartbeat();
    }
    if (!this.broadcastInterval) {
      this.startBroadcastLoop();
    }
  }

  static removeClient(clientOrId: WebSocketClient | string) {
    if (typeof clientOrId === "string") {
      for (const c of this.clients) {
        if (c.id === clientOrId) {
          this.clients.delete(c);
          break;
        }
      }
    } else {
      for (const c of this.clients) {
        if (c.id === clientOrId.id) {
          this.clients.delete(c);
          break;
        }
      }
    }
    console.log(`[WS-TELEMETRY] Client disconnected (Remaining: ${this.clients.size})`);

    if (this.clients.size === 0) {
      this.stopLoops();
    }
  }

  static broadcastTelemetry(eventType: "telemetry" | "actuator_update" = "telemetry") {
    if (this.clients.size === 0) return;
    const payload = JSON.stringify({
      type: eventType,
      timestamp: new Date().toISOString(),
      data: simulator.getSnapshot(),
    });

    for (const client of this.clients) {
      try {
        client.send(payload);
      } catch {
        this.clients.delete(client);
      }
    }

    if (this.clients.size === 0) {
      this.stopLoops();
    }
  }

  static shutdown() {
    this.stopLoops();
    this.clients.clear();
  }

  private static stopLoops() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
    }
  }

  private static startBroadcastLoop() {
    this.broadcastInterval = setInterval(() => {
      this.broadcastTelemetry("telemetry");
    }, 1500);
  }

  private static startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      for (const client of this.clients) {
        try {
          client.send(JSON.stringify({ type: "ping" }));
        } catch {
          this.clients.delete(client);
        }
      }
    }, 15000);
  }
}
