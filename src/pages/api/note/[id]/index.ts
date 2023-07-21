import fs from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { INote } from "types/db/note.type";
import { IUser } from "types/db/user.type";
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
    switch (request.method) {
      case "GET":
        return await GET(request, response, token);
      case "PUT":
        return await PUT(request, response, token);
      case "DELETE":
        return await DELETE(request, response, token);
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
  const { id } = request.query;
  const dbPath = path.resolve(process.cwd(), "db", "notes.mock.json");
  const notes = JSON.parse(await fs.readFile(dbPath, "utf-8")) as INote[];

  const userNotes = notes.filter((note) => note.owner === token.id);
  const note = userNotes.find((note) => note.id === id);

  if (!note) return response.status(404).json({ error: "Notes not found" });

  return response
    .status(200)
    .setHeader(
      "Cache-Control",
      "max-age=60, s-maxage=120, stale-while-revalidate=60"
    )
    .json({ data: note });
}

// Create function to update note
async function PUT(
  request: NextApiRequest,
  response: NextApiResponse,
  token: Pick<IUser, "id" | "username">
) {
  const { id } = request.query;
  const { title, description } = request.body;
  if (!title && !description)
    return response.status(400).json({ error: "Missing body parameter(s)" });

  const dbPath = path.resolve(process.cwd(), "db", "notes.mock.json");
  const notes = JSON.parse(await fs.readFile(dbPath, "utf-8")) as INote[];

  const userNotes = notes.filter((note) => note.owner === token.id);
  const note = userNotes.find((note) => note.id === id);

  if (!note) return response.status(404).json({ error: "Notes not found" });

  note.title = title ?? note.title;
  note.description = description ?? note.description;
  note.updatedAt = new Date();

  await fs.writeFile(dbPath, JSON.stringify(notes, null, 2));

  return response.status(200).json({ data: note });
}

async function DELETE(
  request: NextApiRequest,
  response: NextApiResponse,
  token: Pick<IUser, "id" | "username">
) {
  const { id } = request.query;
  const dbPath = path.resolve(process.cwd(), "db", "notes.mock.json");
  const notes = JSON.parse(await fs.readFile(dbPath, "utf-8")) as INote[];

  const userNotes = notes.filter((note) => note.owner === token.id);
  const note = userNotes.find((note) => note.id === id);

  if (!note) return response.status(404).json({ error: "Notes not found" });

  const newNotes = notes.filter((note) => note.id !== id);
  await fs.writeFile(dbPath, JSON.stringify(newNotes, null, 2));

  return response.status(200).json({ data: note });
}
