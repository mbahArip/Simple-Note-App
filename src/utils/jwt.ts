import jwt from "jsonwebtoken";

export function generateToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
}

export function verifyToken(token: string) {
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET as string);
    return data;
  } catch (error) {
    return undefined;
  }
}
