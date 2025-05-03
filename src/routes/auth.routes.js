import express from "express";
import {
  getCountryHandler,
  logoutHandler,
  refreshTokenHandler,
  signinHandler,
  signupHandler,
} from "../controllers/auth.controllers.js";
import { authenticateUser } from "../middlewares/auth.middlewares.js";

const router = express.Router();

//Signup route
router.post("/signup", signupHandler);

//Signin route
router.post("/signin", signinHandler);

//Refresh token route
router.post("/refresh-token", refreshTokenHandler);

//Logout route
router.post("/logout", authenticateUser, logoutHandler);

//Get country details router
router.get("/country", getCountryHandler);

export default router;
