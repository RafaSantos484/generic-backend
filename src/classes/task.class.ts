import { deleteTableData, editTableData, insertTableData } from "../api/db.api";
import { getTrimmed } from "../utils";

export type TaskObj = {
  userId: string;
  title: string;
  description: string;
  finished: 0 | 1;
};
type TaskKeys = keyof TaskObj;
const taskAttrsTypes = {
  userId: "string",
  title: "string",
  description: "string",
  finished: "number",
};

export default class Task {
  private userId: string;
  private title?: string;
  private description?: string;
  private finished?: 0 | 1;

  constructor(obj: any, isEditing = false) {
    const numKeysObj = Object.keys(obj).length;
    const minNumKeys = isEditing ? 2 : Object.keys(taskAttrsTypes).length;
    if (obj === null || typeof obj !== "object" || numKeysObj < minNumKeys) {
      throw new Error("Invalid object");
    }

    for (const key of Object.keys(obj)) {
      if (!(key in taskAttrsTypes)) {
        throw new Error(`Unknown key "${key}"`);
      } else if (typeof obj[key] !== taskAttrsTypes[key as TaskKeys]) {
        throw new Error(
          `Field ${key} must be of type ${taskAttrsTypes[key as TaskKeys]}`
        );
      }
    }

    obj = getTrimmed(obj);
    if (!obj.userId) {
      throw new Error("Invalid user ID");
    }
    if ("title" in obj && !obj.title) {
      throw new Error("Invalid title");
    }
    if ("description" in obj && !obj.description) {
      throw new Error("Invalid description");
    }
    if ("finished" in obj && ![0, 1].includes(obj.finished)) {
      throw new Error("Invalid 'finished' value");
    }

    this.userId = obj.userId;
    this.title = obj.title;
    this.description = obj.description;
    this.finished = obj.finished;
  }

  async create() {
    try {
      await insertTableData(
        "tasks",
        "USERID, TITLE, DESCRIPTION, FINISHED",
        `${this.userId}, "${this.title}", "${this.description}", ${this.finished}`
      );
    } catch (e: any) {
      console.log(e);
      if (e.errno === 1452) {
        throw new Error("User not found");
      }

      throw new Error("Error registering task");
    }
  }

  async edit(taskId: string) {
    let err = "";
    try {
      const set = `${this.title ? `TITLE = "${this.title}", ` : ""}${
        this.description ? `DESCRIPTION = "${this.description}", ` : ""
      }${this.finished ? `FINISHED = ${this.finished}, ` : ""}`.slice(0, -2);
      const resultSetHeader = await editTableData(
        "tasks",
        set,
        `USERID = ${this.userId} AND ID = ${taskId}`
      );

      const editCount = resultSetHeader.affectedRows;
      if (editCount === 0) {
        err = "Task not found";
        throw new Error(err);
      }
    } catch (e: any) {
      // console.log(e);
      throw new Error(err || "Error editing task");
    }
  }

  static async delete(userId: string, taskId: string) {
    let err = "";
    try {
      const resultSetHeader = await deleteTableData(
        "tasks",
        `USERID = ${userId} AND ID = ${taskId}`
      );
      const deleteCount = resultSetHeader.affectedRows;
      if (deleteCount === 0) {
        err = "Task not found";
        throw new Error(err);
      }
    } catch (e: any) {
      // console.log(e);
      throw new Error(err || "Error deleting task");
    }
  }
}
