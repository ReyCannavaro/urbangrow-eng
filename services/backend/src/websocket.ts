import { simulator } from "./simulator";

export interface WebSocketClient {
  send: (data: string) => void;
  id: string;
}

export class TelemetryWebSocketManager {
  private static clients: Set<WebSocketClient> = new Set();
  private static heartbeatInterval: any = null;

  static addClient(client: WebSocketClient) {
    this.clients.add(client);
    console.log(`[WS-TELEMETRY] Client connected: ${client.id} (Total: ${this.clients.size})`);

    // Send immediate current snapshot
    client.send(JSON.stringify({ type: "snapshot", data: simulator.getSnapshot() }));

    if (!this.heartbeatInterval) {
      this.startHeartbeat();
    }
  }

  static removeClient(client: WebSocketClient) {
    this.clients.delete(client);
    console.log(`[WS-TELEMETRY] Client disconnected: ${client.id} (Remaining: ${this.clients.size})`);

    if (this.clients.size === 0 && this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  static broadcastTelemetry() {
    if (this.clients.size === 0) return;
    const payload = JSON.stringify({
      type: "telemetry",
      timestamp: new Date().toISOString(),
      data: simulator.getSnapshot(),
    });

    for (const client of this.clients) {
      try {
        client.send(payload);
      } catch (err) {
        this.clients.delete(client);
      }
    }
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
