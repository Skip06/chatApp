import jwt from 'jsonwebtoken'
import type {Request, Response, NextFunction} from 'express'

export interface AuthRequest extends Request {
    user?: { userId: string };
  }
  
  export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1]; //excludes the bearer word
  
    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }
  
    try {
      const secret = process.env.JWT_SECRET!;
      const decoded = jwt.verify(token, secret) as { userId: string }; // excludes the iat 
      
      // Attach the user ID to the request object for use in other routes
      req.user = decoded;    
      next(); 
    } catch (err) {
      return res.status(403).json({ error: "Invalid " });
    }
  };
export default authenticateToken
