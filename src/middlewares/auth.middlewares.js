import jwt from "jsonwebtoken";
import HttpError from "../utils/errorClass.js";
import userModel from "../models/user.models.js";

const authenticateUser = async (req, res, next) => {
  try {
    // Fetching the token from the header
    const authHeader = req.header("Authorization");

    // Checking if the token exists or not
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError(401, "Please log in again.");
    }

    // Splitting the token to the Bearer
    const token = authHeader.split(" ")[1];

    // Verifying the token and sending it in the request
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decodedData) {
      throw new HttpError(403, "Please log in again.");
    }

    const user = await userModel.findById(decodedData._id).select("-password");

    if (!user) {
      throw new HttpError(404, "User not found. Please log in again.");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`Authentication middleware error: ${error.message}`);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || "Authentication failed. Please try again later.",
    });
  }
};

export { authenticateUser };
