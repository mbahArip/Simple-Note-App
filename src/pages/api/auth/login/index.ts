import fs from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { IUser } from "types/db/user.type";
import { generateToken } from "utils/jwt";
import { comparePassword } from "utils/passwordHelper";

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
    const isExistingUser = users.find(
      (user: IUser) => user.username === username
    );

    if (!isExistingUser)
      return response.status(400).json({ error: "Can't find user" });

    const passwordMatch = comparePassword(password, isExistingUser.password);

    if (!passwordMatch)
      return response.status(400).json({ error: "Invalid password" });

    const payload: Pick<IUser, "id" | "username"> = {
      id: isExistingUser.id,
      username: isExistingUser.username,
    };

    const token = generateToken(payload);

    return response
      .status(200)
      .setHeader(
        "Set-Cookie",
        `authtoken=${token}; path=/; Secure; SameSite=Strict; Max-Age=${
          60 * 60 * 24
        }`
      )
      .json({ token });
  } catch (error: any) {
    return response
      .status(error.code ?? 500)
      .json({ error: error.message ?? "Internal server error" });
  }
}
