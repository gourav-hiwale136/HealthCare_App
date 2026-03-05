import User from "../models/authModel.js";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
// import { comparePassword } from "../utils/comparePassword.js";
import { generateToken } from "../utils/generateTokenUtils.js";


export const registerUserService = async ({ username, email, password, phone, role }) => {

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
    role
  });

  await newUser.save();

  return newUser;
};



export const loginUserService = async ({ email, password }) => {

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


export const getProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};



export const updateCredentialsService = async (userId, updateData) => {

  const { username, email, phone, password } = updateData;

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

  return user;
};