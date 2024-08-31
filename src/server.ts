import express from "express";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.route";
import { tasksRouter } from "./routes/tasks.route";

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use("/auth", authRouter);
app.use("/tasks", tasksRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
