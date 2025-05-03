import express from "express";

import { authenticateUser } from "../middlewares/auth.middlewares.js";
import {
  getSendedConnectionRequestsHandler,
  sendConnectionRequestHandler,
  sendConnectionResponseHandler,
  getAcceptedRequestsHandler,
} from "../controllers/connection.controllers.js";

const router = express.Router();

// Get accepted letters
router.get("/accepted", authenticateUser, getAcceptedRequestsHandler);

//Get sent and received letters
router.get(
  "/:requestType",
  authenticateUser,
  getSendedConnectionRequestsHandler
);

//Send connection request route
router.post("/send", authenticateUser, sendConnectionRequestHandler);

//Send connection response
router.post(
  "/:requestType/:requestId",
  authenticateUser,
  sendConnectionResponseHandler
);

export default router;
