import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getTableData, insertTableData } from "../api/db.api";
import { getTrimmed, isValidEmail, isValidPassword } from "../utils";

type UserObj = {
  email: string;
  password: string;
};

export default class User {
  private email: string;
  private password: string;

  constructor(obj: any) {
    if (
      obj === null ||
      typeof obj !== "object" ||
      Object.keys(obj).length !== 2
    ) {
      throw new Error("Invalid object");
    }
    if (!("email" in obj) || !("password" in obj)) {
      throw new Error("Object must contain email and password");
    }
    if (typeof obj.email !== "string" || typeof obj.password !== "string") {
      throw new Error("User object email and password must be strings");
    }

    obj = getTrimmed(obj);
    if (!isValidEmail(obj.email)) {
      throw new Error("Invalid email");
    }
    if (!isValidPassword(obj.password)) {
      throw new Error("Invalid password");
    }

    this.email = obj.email;
    this.password = obj.password;
  }

  async register() {
    const encryptedPassword = await bcrypt.hash(this.password, 10);
    try {
      await insertTableData(
        "USERS",
        "EMAIL, PASSWORD",
        `"${this.email}", "${encryptedPassword}"`
      );
    } catch (e: any) {
      console.log(e);
      if (e.errno === 1062) {
        throw new Error("User already exists");
      }

      throw new Error("Error registering user");
    }
  }

  async login() {
    let err = "";
    try {
      const query = await getTableData<UserObj & { id: string }>("USERS", {
        where: `EMAIL = "${this.email}"`,
      });
      if (query.length === 0) {
        err = "User not found";
        throw new Error(err);
      }

      const userObj = query[0];
      const isValidPassword = await bcrypt.compare(
        this.password,
        userObj.password
      );
      if (!isValidPassword) {
        err = "User not found";
        throw new Error(err);
      }

      const userId = query[0].id.toString();
      const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
        expiresIn: "24h",
      });
      return token;
    } catch (e: any) {
      throw new Error(err || "Failed to login");
    }
  }
}
