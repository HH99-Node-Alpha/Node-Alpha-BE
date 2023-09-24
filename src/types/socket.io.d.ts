declare module 'socket.io' {
  interface Socket {
    user?: any;
    // pairs?: any;
  }
}

export interface invitations {
  workspaceName?: any;
}

// import { Socket as IOSocket } from "socket.io";

// declare module 'socket.io' {
// interface Socket extends IOSocket {
// user?: any;
// }
// }
