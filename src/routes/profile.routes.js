import express from "express";

import { authenticateUser } from "../middlewares/auth.middlewares.js";
import {
  getProfileDetailsHandler,
  updatePasswordHandler,
  updateProfileDetailsHandler,
  updateUsernameHandler,
} from "../controllers/profile.controllers.js";

const router = express.Router();

router
  .route("/details")
  .get(authenticateUser, getProfileDetailsHandler)
  .patch(authenticateUser, updateProfileDetailsHandler);

router.patch("/edit-username", authenticateUser, updateUsernameHandler);

router.patch("/edit-password", authenticateUser, updatePasswordHandler);

export default router;
