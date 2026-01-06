import jwt from "jsonwebtoken";
import { prisma } from "../libs/prisma.js";
import { isBlocked } from "../libs/blockedUsers.js";

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
    if (isBlocked(user.id)) {
      console.warn(`Blocked user login attempt: ${user.email} (${user.id})`);
      return res.status(403).json({ message: 'Account blocked. Contact admin.' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default auth;