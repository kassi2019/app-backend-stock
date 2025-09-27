import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
    cors: {
        // En production, tu dois remplacer '*' par l’URL exacte de tes applis clientes.
        origin: '*', // ⚠️ à restreindre en prod
    },
})
//     En prod, il faut limiter origin uniquement aux applications autorisées.
// Exemple :
//     @WebSocketGateway({
//   cors: {
//     origin: ['https://mon-app-web.com', 'https://mon-app-mobile.com'],
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// })
export class ProduitGateway {
    @WebSocketServer()
    server!: Server;
    // Permet d'envoyer un événement aux clients
    notifyProduitUpdated(produit: any) {
        this.server.emit('produitUpdated', produit);
    }

     notifyProduitStockTemporelUpdated(produitstock: any) {
        this.server.emit('produitstockUpdated', produitstock);
    }
}
