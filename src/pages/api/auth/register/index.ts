import fs from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { IUser } from "types/db/user.type";
import generateId from "utils/generateId";
import { hashPassword } from "utils/passwordHelper";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== "POST")
    return response.status(405).json({ error: "Method not allowed" });

  try {
    const { username, password } = request.body;

    if (!username || !password)
      return response.status(400).json({ error: "Missing body parameter(s)" });

    const dbPath = path.resolve(process.cwd(), "db", "users.mock.json");

    const users = JSON.parse(await fs.readFile(dbPath, "utf-8"));
    const isExistingUser = users.some(
      (user: IUser) => user.username === username
    );

    if (isExistingUser)
      return response.status(400).json({ error: "User already exists" });

    const newUser: IUser = {
      id: generateId(),
      username,
      password: hashPassword(password),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(newUser);
    await fs.writeFile(dbPath, JSON.stringify(users, null, 2));

    return response.status(200).json(newUser);
  } catch (error: any) {
    return response
      .status(error.code ?? 500)
      .json({ error: error.message ?? "Internal server error" });
  }
}
