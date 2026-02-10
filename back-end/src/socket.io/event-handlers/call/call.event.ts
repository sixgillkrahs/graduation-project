import { BaseEvent } from "../../base.event";
import { WebSocketService } from "@/services/websocket.service";

export class CallEvent extends BaseEvent {
  constructor() {
    super();
  }

  // Initiate a call
  initiateCall = async (req: any) => {
    return this.handleRequest(req, async () => {
      const { targetUserId, ...callData } = req.body;
      const { user } = req; // Assuming user info is attached to socket req by middleware

      if (!targetUserId) {
        throw new Error("Missing targetUserId");
      }

      console.log(
        `[CallEvent] Initiating call from ${user._id} to ${targetUserId}`,
      );
      const socket = req.socket;
      // Emit incoming call event to target user
      socket.to(targetUserId).emit("call:incoming", {
        from: user,
        ...callData,
      });

      return {
        code: 200,
        state: 1,
        message: "Call initiated",
        data: null,
      };
    });
  };

  // Answer a call
  answerCall = async (req: any) => {
    return this.handleRequest(req, async () => {
      const { targetUserId, signal } = req.body;

      if (!targetUserId) throw new Error("Missing targetUserId");

      console.log(`[CallEvent] Creating answer for ${targetUserId}`);

      req.socket.to(targetUserId).emit("call:answered", {
        signal,
      });

      return {
        code: 200,
        state: 1,
        message: "Call answered",
        data: null,
      };
    });
  };

  // Reject a call
  rejectCall = async (req: any) => {
    return this.handleRequest(req, async () => {
      const { targetUserId } = req.body;

      if (!targetUserId) throw new Error("Missing targetUserId");

      req.socket.to(targetUserId).emit("call:rejected", {
        message: "Call rejected",
      });

      return {
        code: 200,
        state: 1,
        message: "Call rejected",
        data: null,
      };
    });
  };

  // End a call
  endCall = async (req: any) => {
    return this.handleRequest(req, async () => {
      const { targetUserId } = req.body;

      // Notice to the other party
      if (targetUserId) {
        req.socket.to(targetUserId).emit("call:ended", {
          message: "Call ended",
        });
      }

      return {
        code: 200,
        state: 1,
        message: "Call ended",
        data: null,
      };
    });
  };

  // ICE Candidate / Signal exchange
  exchangeSignal = async (req: any) => {
    return this.handleRequest(req, async () => {
      const { targetUserId, signal } = req.body;

      if (!targetUserId || !signal) throw new Error("Missing data");

      req.socket.to(targetUserId).emit("call:signal", {
        signal,
      });

      return {
        code: 200,
        state: 1,
        message: "Signal exchanged",
        data: null,
      };
    });
  };
}
