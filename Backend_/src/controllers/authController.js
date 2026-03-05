import {
  registerUserService,
  loginUserService,
  getProfileService,
  updateCredentialsService
} from "../services/authService.js";


export const registerUser = async (req, res) => {
  try {

    const user = await registerUserService(req.body);

    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const loginUser = async (req, res) => {
  try {

    const { user, token } = await loginUserService(req.body);

    res.status(200).json({
      message: "Login successful",
      user,
      token
    });

  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};



export const getProfile = async (req, res) => {
  try {

    const userId = req.user._id.toString();

    const user = await getProfileService(userId);

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {

    res.status(404).json({
      success: false,
      message: error.message
    });

  }
};


export const updateCredentials = async (req, res) => {
  try {

    const userId = req.user._id.toString();

    const user = await updateCredentialsService(userId, req.body);

    const userResponse = (({ _id, username, email, phone, role }) =>
      ({ _id, username, email, phone, role }))(user);

    res.status(200).json({
      success: true,
      message: "Credentials updated successfully",
      user: userResponse
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }
};