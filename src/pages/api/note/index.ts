import fs from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { INote } from "types/db/note.type";
import { IUser } from "types/db/user.type";
import generateId from "utils/generateId";
import { verifyToken } from "utils/jwt";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const { authtoken } = request.cookies;
    if (!authtoken) return response.status(401).json({ error: "Unauthorized" });

    const token = verifyToken(authtoken as string) as Pick<
      IUser,
      "id" | "username"
    >;
    console.log(token);
    switch (request.method) {
      case "GET":
        return await GET(request, response, token);
      case "POST":
        return await POST(request, response, token);
      default:
        return response.status(405).json({ error: "Method not allowed" });
    }
  } catch (error: any) {
    return response
      .status(error.code ?? 500)
      .json({ error: error.message ?? "Internal server error" });
  }
}

async function GET(
  request: NextApiRequest,
  response: NextApiResponse,
  token: Pick<IUser, "id" | "username">
) {
  const dbPath = path.resolve(process.cwd(), "db", "notes.mock.json");
  const notes = JSON.parse(await fs.readFile(dbPath, "utf-8")) as INote[];

  const usernotes = notes
    .filter((note) => note.owner === token.id)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  return response
    .status(200)
    .setHeader(
      "Cache-Control",
      "max-age=60, s-maxage=120, stale-while-revalidate=60"
    )
    .json({ data: usernotes });
}

async function POST(
  request: NextApiRequest,
  response: NextApiResponse,
  token: Pick<IUser, "id" | "username">
) {
  const { title, description } = request.body;
  if (!title || !description)
    return response.status(400).json({ error: "Missing body parameter(s)" });

  const dbPath = path.resolve(process.cwd(), "db", "notes.mock.json");
  const notes = JSON.parse(await fs.readFile(dbPath, "utf-8")) as INote[];

  const newNote: INote = {
    id: generateId(64),
    owner: token.id,
    title,
    description,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  notes.push(newNote);

  await fs.writeFile(dbPath, JSON.stringify(notes, null, 2));

  return response.status(201).json({ data: newNote });
}
