import { User } from "./auth"; 

declare global {
  namespace Express {
    export interface Request {
      user?: User & { id: string }; 
    }
  }
}


