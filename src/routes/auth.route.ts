import { Router } from "express";
import User from "../classes/user.class";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.register();
    res.sendStatus(200);
  } catch (e: any) {
    // console.log(e);
    res.status(400).send(e.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const user = new User(req.body);
    const token = await user.login();
    res.status(200).send({ token });
  } catch (e: any) {
    res.status(400).send(e.message);
    return;
  }
});
