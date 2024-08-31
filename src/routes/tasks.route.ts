import { Router } from "express";
import Task, { TaskObj } from "../classes/task.class";
import verifyJWT from "../middlewares/jwt.middleware";
import { getTableData } from "../api/db.api";

export const tasksRouter = Router();

tasksRouter.get("/", verifyJWT, async (req, res) => {
  const { userId } = req.body;
  try {
    const data = await getTableData<TaskObj>("tasks", {
      where: `USERID = ${userId}`,
    });
    res.status(200).send(data);
  } catch (e: any) {
    console.log(e);
    res.status(500).send(e.message);
  }
});

tasksRouter.post("/create", verifyJWT, async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.create();
    res.sendStatus(200);
  } catch (e: any) {
    // console.log(e);
    res.status(400).send(e.message);
  }
});

tasksRouter.post("/edit", verifyJWT, async (req, res) => {
  const { taskId } = req.body;
  delete req.body.taskId;
  if (!taskId || typeof taskId !== "string") {
    res.status(400).send("Invalid task id");
    return;
  }

  try {
    const task = new Task(req.body, true);
    await task.edit(taskId);
    res.sendStatus(200);
  } catch (e: any) {
    res.status(400).send(e.message);
  }
});

tasksRouter.delete("/delete", verifyJWT, async (req, res) => {
  const { userId, taskId } = req.body;
  if (!taskId || typeof taskId !== "string") {
    res.status(400).send("Invalid task id");
    return;
  }

  try {
    await Task.delete(userId, taskId);
    res.sendStatus(200);
  } catch (e: any) {
    res.status(400).send(e.message);
  }
});
