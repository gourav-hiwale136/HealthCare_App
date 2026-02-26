import User from "../models/authModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



 const registerUser = async (req, res) => {
    try {
        const { username, email, password, phone, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword, phone, role });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    };  
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
        { id: user._id.toString() },
         process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
    //    await user.save();
        res.status(200).json({ message: "Login successful", user, token });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const updateCredentials = async (req, res) => {
  try {
    const userId = req.user._id.toString(); // from authMiddleware
    const { username, email, phone, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update fields if provided
    if (username) user.username = username;

    if (email) {
      // Check if new email is already taken by another user
      const emailExists = await User.findOne({ email });
      if (emailExists && emailExists._id.toString() !== userId) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
      user.email = email;
    }

    if (phone) user.phone = phone;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    // Return user without password
    const userResponse = (({ _id, username, email, phone, role }) => ({ _id, username, email, phone, role }))(user);

    res.status(200).json({ success: true, message: "Credentials updated successfully", user: userResponse });
  } catch (error) {
    console.error("Update Credentials Error:", error.message);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


export { registerUser, loginUser, updateCredentials };