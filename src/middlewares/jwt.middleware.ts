import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).send("Access Denied: No Token Provided");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { userId } = payload;
    if (!userId || typeof userId !== "string") {
      throw new Error();
    }

    req.body.userId = userId;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};

export default verifyJWT;
