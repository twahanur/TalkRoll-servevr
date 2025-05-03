import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/user.models.js";
import { createAccessToken, createRefreshToken } from "../utils/tokens.js";
import HttpError from "../utils/errorClass.js";
import { validateSignupData } from "../utils/validation.js";

const signupHandler = async (req, res) => {
  try {
    validateSignupData(req);

    const { username, email, password, age, gender } = req.body;

    // checking if the user already exists or not
    const user = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (user && user.username === username) {
      throw new HttpError(400, "Username already exists!");
    }
    if (user && user.email === email) {
      throw new HttpError(400, "Email already exists!");
    }

    //Encrypting the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Creating a new user
    const newUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
      age,
      gender,
    });

    // Creating refresh and access token
    const refreshToken = createRefreshToken({ _id: newUser._id });
    const accessToken = createAccessToken({
      _id: newUser._id,
      email: newUser.email,
    });

    //Setting refresh token in a cookie and sending access token with a response
    return res
      .status(201)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 30,
      })
      .json({
        success: true,
        message: "User created successfully",
        accessToken: accessToken,
      });
  } catch (error) {
    console.error("Sign up error: ", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const signinHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Checking if the user exist or not
    const user = await userModel.findOne({ email });

    if (!user) {
      throw new HttpError(404, "Invalid credentials");
    }

    //Checking if the password is correct or not
    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      throw new HttpError(401, "Invalid credentials");
    }

    //Creating access and refresh tokens
    const refreshToken = createRefreshToken({ _id: user._id });
    const accessToken = createAccessToken({
      _id: user._id,
      email: user.email,
    });

    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 30,
      })
      .status(200)
      .json({
        success: true,
        message: `Welcome back! ${user.nickName || user.username}`,
        accessToken,
      });
  } catch (error) {
    console.error("Sign in error: ", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const refreshTokenHandler = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    // Checking if the refresh token exists
    if (!refreshToken) {
      throw new HttpError(400, "Please log in again.");
    }

    // Verifying the token
    const decodedData = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);

    if (!decodedData) {
      throw new HttpError(401, "Please log in again.");
    }

    // Fetching the user
    const user = await userModel.findById(decodedData._id);

    // Creating a new access token
    const accessToken = createAccessToken({
      _id: user._id,
      username: user.username,
      email: user.email,
    });

    return res.status(200).json({
      success: true,
      message: "New access token created",
      accessToken,
    });
  } catch (error) {
    console.error("Refresh token error: ", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong. Please try again later.",
    });
  }
};

const logoutHandler = async (req, res) => {
  try {
    const isCookieDeleted = res.clearCookie("refreshToken");

    if (isCookieDeleted) {
      return res.status(200).json({
        success: true,
        message: "User logout successfully",
      });
    }
  } catch (error) {
    console.log("logout error: " + error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getCountryHandler = async (req, res) => {
  try {
    const geoLocationApiKey = process.env.GEOLOCATION_API_KEY;

    const response = await fetch(
      `https://api.ipgeolocation.io/ipgeo?apiKey=${geoLocationApiKey}`
    );
    const data = await response.json();

    const { country_name, country_flag } = data;

    return res.status(200).json({
      success: true,
      message: "Country details fetched successfully",
      data: { country_name, country_flag },
    });
  } catch (error) {
    console.log("get country details error: " + error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the country details!",
    });
  }
};

export {
  signupHandler,
  signinHandler,
  refreshTokenHandler,
  logoutHandler,
  getCountryHandler,
};
