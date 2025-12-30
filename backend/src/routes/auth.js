import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../libs/prisma.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    console.log("Register attempt for email:", req.body.email);
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    // Create JWT token
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    console.log("User registered successfully:", email);

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    console.log("Login attempt for email:", req.body.email, "password length:", req.body.password?.length);
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    let finalUser = user;
    
    // If user doesn't exist, create them (for testing)
    if (!user) {
      console.log("Creating test user:", email);
      const hashedPassword = await bcrypt.hash(password, 10);
      finalUser = await prisma.user.create({
        data: { 
          name: email.split('@')[0], // Use part before @ as name
          email, 
          password: hashedPassword,
          role: 'PATIENT'
        }
      });
      console.log("User created successfully:", finalUser.email);
    }
    
    if (!finalUser) {
      console.log("User not found for email:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, finalUser.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign({ id: finalUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    console.log("Login successful for user:", email);

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({ token, user: { id: finalUser.id, name: finalUser.name, email: finalUser.email, role: finalUser.role, doctor: finalUser.doctor } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  console.log("Logout request");
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// GET CURRENT USER
router.get("/me", auth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE DOCTOR (for testing)
router.post("/create-doctor", auth, async (req, res) => {
  try {
    const { specialty, experience, fee } = req.body;
    const doctor = await prisma.doctor.create({
      data: {
        userId: req.user.id,
        specialty,
        experience: parseInt(experience),
        fee: parseFloat(fee)
      }
    });
    res.status(201).json(doctor);
  } catch (err) {
    console.error("Create doctor error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE ADMIN (for testing - in production, this should be restricted)
router.post("/create-admin", auth, async (req, res) => {
  try {
    // For testing purposes, allow any logged-in user to become admin
    // In production, this should only be allowed by existing admins
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { role: 'ADMIN' }
    });
    res.json({ message: "User role updated to ADMIN", user });
  } catch (err) {
    console.error("Create admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
