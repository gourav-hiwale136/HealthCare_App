import User from "../models/authModel.js";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import { generateToken } from "../utils/tokenUtils.js";

export const registerUserService = async (data) => {
  const { username, email, password, phone, role } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await hashPassword(password);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    phone,
    role,
  });

  await newUser.save();

  return newUser;
};

export const loginUserService = async (data) => {
  const { email, password } = data;

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid password");
  }

  const token = generateToken(user._id.toString());

  return { user, token };
};

export const updateCredentialsService = async (userId, data) => {
  const { username, email, phone, password } = data;

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (username) user.username = username;

  if (email) {
    const emailExists = await User.findOne({ email });
    if (emailExists && emailExists._id.toString() !== userId) {
      throw new Error("Email already in use");
    }
    user.email = email;
  }

  if (phone) user.phone = phone;

  if (password) {
    user.password = await hashPassword(password);
  }

  await user.save();

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
};