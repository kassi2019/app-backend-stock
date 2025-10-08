import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // à adapter selon ton frontend
  },
})
export class TableauBordGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  afterInit() {
    console.log('✅ WebSocket initialisé');
  }

  handleConnection(client: any) {
    console.log(`🟢 Client connecté : ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`🔴 Client déconnecté : ${client.id}`);
  }

  // méthode pour notifier les clients
  envoyerMaj(data: any) {
    this.server.emit('majTableauBord', data);
  }
}
