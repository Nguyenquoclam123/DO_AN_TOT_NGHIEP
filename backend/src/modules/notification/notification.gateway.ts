import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notifications',
})
export class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('NotificationGateway');

  afterInit(server: Server) {
    this.logger.log('Notification Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Notification Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Notification Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinUserRoom')
  handleJoinUserRoom(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `user_${data.userId}`;
    client.join(roomName);
    this.logger.log(`Client ${client.id} joined personal room ${roomName}`);
    return { event: 'joinedUserRoom', data: roomName };
  }

  // Method to send notification to a specific user
  sendToUser(userId: string, event: string, payload: any) {
    const roomName = `user_${userId}`;
    this.server.to(roomName).emit(event, payload);
    this.logger.log(`Sent ${event} to room ${roomName}`);
  }

  // Method to broadcast to all
  broadcast(event: string, payload: any) {
    this.server.emit(event, payload);
  }
}
