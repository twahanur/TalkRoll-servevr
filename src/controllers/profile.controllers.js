import validator from "validator";
import bcrypt from "bcrypt";

import { validateProfileEditData } from "../utils/validation.js";
import userModel from "../models/user.models.js";
import HttpError from "../utils/errorClass.js";

const getProfileDetailsHandler = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error(`Get profile error: ${error.message}`);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const updateProfileDetailsHandler = async (req, res) => {
  try {
    const user = req.user;

    //Validation
    validateProfileEditData(req);

    Object.keys(req.body).forEach((field) => {
      user[field] = req.body[field];
    });

    await user.save();
    return res.status(200).json({
      success: true,
      message: `${
        user.nickName || user.username
      } your profile updated successfully`,
      user,
    });
  } catch (error) {
    console.error(`Update profile details error: ${error.message}`);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const updateUsernameHandler = async (req, res) => {
  try {
    const user = req.user;

    const { username } = req.body;

    if (user.isUsernameChangedOnce) {
      throw new HttpError(403, "Can't update the username");
    }

    if (!username || !validator.isLength(username, { min: 4, max: 30 })) {
      throw new HttpError(400, "Username length must be between 4 to 30");
    } else if (!validator.isAlphanumeric(username)) {
      throw new HttpError(
        400,
        "Username must contain only letters and numbers"
      );
    }

    const userByUsername = await userModel.findOne({ username });

    if (userByUsername) {
      throw new HttpError(400, "Username is not available");
    }

    user.username = username;
    user.isUsernameChangedOnce = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Username updated successfully",
      user,
    });
  } catch (error) {
    console.error("Username edit error: " + error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const updatePasswordHandler = async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await userModel.findById(_id);

    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      throw new HttpError(400, "All fields are required");
    }

    // Validate current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isValidPassword) {
      throw new HttpError(401, "Incorrect current password");
    }

    // Prevent reusing the same password
    if (currentPassword === newPassword) {
      throw new HttpError(
        400,
        "New password cannot be the same as the current password."
      );
    }

    // Validate password confirmation
    if (newPassword !== confirmNewPassword) {
      throw new HttpError(400, "Passwords do not match");
    }

    // Validate password strength
    if (!validator.isStrongPassword(newPassword)) {
      throw new HttpError(
        400,
        "Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters."
      );
    }

    //Hashing the password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password update error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export {
  getProfileDetailsHandler,
  updateProfileDetailsHandler,
  updateUsernameHandler,
  updatePasswordHandler,
};
