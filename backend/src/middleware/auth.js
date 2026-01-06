import jwt from "jsonwebtoken";
import { prisma } from "../libs/prisma.js";

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const jwtSecret = process.env.JWT_SECRET || "dev_secret";
    if (!process.env.JWT_SECRET) console.warn("Warning: JWT_SECRET not set — using development fallback secret.");
    const decoded = jwt.verify(token, jwtSecret);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { doctor: true }
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default auth;