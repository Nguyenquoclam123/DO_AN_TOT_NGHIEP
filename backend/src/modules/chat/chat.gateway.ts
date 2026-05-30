import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log('Chat Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.roomId);
    this.logger.log(`Client ${client.id} joined room ${data.roomId}`);
    return { event: 'joinedRoom', data: data.roomId };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.roomId);
    this.logger.log(`Client ${client.id} left room ${data.roomId}`);
    return { event: 'leftRoom', data: data.roomId };
  }

  @SubscribeMessage('joinUserRoom')
  handleJoinUserRoom(
    @MessageBody() data: { userId: string, companyId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.userId) {
      const userRoom = `user_${data.userId}`;
      client.join(userRoom);
      this.logger.log(`Client ${client.id} joined personal room ${userRoom}`);
    }
    if (data.companyId) {
      const companyRoom = `company_${data.companyId}`;
      client.join(companyRoom);
      this.logger.log(`Client ${client.id} joined company room ${companyRoom}`);
    }
    return { event: 'joinedRooms' };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(`Received sendMessage event from client ${client.id}. Data: ${JSON.stringify(data)}`);
      
      const { roomId, messageText, senderId } = data;
      
      if (!roomId || !messageText || !senderId) {
        this.logger.error('Missing required fields in sendMessage data');
        return { error: 'Missing required fields' };
      }

      // Check if the client is actually in the room they are sending to
      const rooms = client.rooms;
      if (!rooms.has(roomId)) {
        this.logger.warn(`Client ${client.id} is sending to room ${roomId} but is NOT in it. Force joining.`);
        client.join(roomId);
      }

      const message = await this.chatService.sendMessage(senderId, { roomId, messageText });
      
      // Check who is in the room
      const clientsInRoom = await this.server.in(roomId).allSockets();
      this.logger.log(`Broadcasting newMessage to room ${roomId}. Clients in room: ${Array.from(clientsInRoom).join(', ')}`);

      // 1. Broadcast to the specific chat room
      this.server.to(roomId).emit('newMessage', message);

      // 2. Broadcast to participants' rooms for global notifications
      const room = await this.chatService.getRoomById(roomId);
      if (room) {
        this.logger.log(`Broadcasting to personal rooms: user_${room.candidateId}, company_${room.companyId}`);
        // Send to candidate's personal room
        this.server.to(`user_${room.candidateId}`).emit('newMessage', message);
        // Send to company room
        this.server.to(`company_${room.companyId}`).emit('newMessage', message);
        this.server.to(`user_${room.companyId}`).emit('newMessage', message);
      }
      
      return message;
    } catch (error) {
      this.logger.error(`Error in handleMessage: ${error.message}`, error.stack);
      return { error: 'Failed to send message' };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { roomId: string, userId: string, isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.roomId).emit('userTyping', data);
  }
}
