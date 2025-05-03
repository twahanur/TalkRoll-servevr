import HttpError from "../utils/errorClass.js";
import userModel from "../models/user.models.js";
import connectionModel from "../models/connection.models.js";

const sendConnectionRequestHandler = async (req, res) => {
  try {
    const user = req.user;
    const { _id: userId, genderPreference, agePreference,gender } = user;
    const { letterMessage } = req.body;
    console.log("user", user);

    //Validating the Letter's message
    if (!letterMessage || letterMessage === "") {
      throw new HttpError(400, "Letter cannot be empty");
    }

    if (letterMessage.length < 30 || letterMessage.length > 1111) {
      throw new HttpError(400, "Letter's length must be between 30 to 1111");
    }

    // Finding the users who matches the creteria
    const users = await userModel
      .find({
        _id: { $ne: userId },
        $or: [
          {
            $and: [
              { gender: genderPreference },
              { genderPreference: gender },
            ],
          },
          { genderPreference: "both" },
        ],
        age: {
          $gte: agePreference.fromAge,
          $lte: agePreference.toAge,
        },
      })
      .select("_id agePreference");


      // const users = await userModel.find();
    if (!users || users.length === 0) {
      throw new HttpError(404, "No matching user found");
    }

    //Creating a random index and picking up the user according to that random index
    const randomIndex = Math.floor(Math.random() * users.length);
    let randomUser = users[randomIndex];

    //Checking if the random user's age preference is matching the creteria or not.
    if (
      randomUser.agePreference.fromAge > user.age ||
      randomUser.agePreference.toAge < user.age
    ) {
      throw new HttpError(404, "No matching user found");
    }

    //If everything goes well then creating a new connection request
    const newConnection = await connectionModel.create({
      fromUser: userId,
      toUser: randomUser._id,
      status: "send",
      letterMessage,
    });

    return res.status(200).json({
      success: true,
      message: "Letter send successfully",
      connection: newConnection,
    });
  } catch (error) {
    console.error("Send connection request error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};

const getSendedConnectionRequestsHandler = async (req, res) => {
  try {
    const user = req.user;
    const { requestType } = req.params;

    //Validating the request type
    if (!["sent", "received"].includes(requestType)) {
      throw new HttpError(400, `Invalid request type: ${requestType}`);
    }

    let connectionRequests;

    //Fetching the connections according to request type
    if (requestType === "sent") {
      connectionRequests = await connectionModel
        .find({ status: "send", fromUser: user._id })
        .populate("toUser", "nickName username photoUrl");
    } else if (requestType === "received") {
      connectionRequests = await connectionModel
        .find({ status: "send", toUser: user._id })
        .populate("fromUser", "nickName username photoUrl");
    }

    return res.status(200).json({
      success: true,
      message: "Requests fetched successfully",
      connectionRequests,
    });
  } catch (error) {
    console.log("Get connection requests error: " + error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const sendConnectionResponseHandler = async (req, res) => {
  try {
    const { requestType, requestId } = req.params;

    if (!["accepted", "rejected"].includes(requestType)) {
      throw new HttpError(400, `Invalid request type: ${requestType}`);
    }

    const connectionRequest = await connectionModel.findById(requestId);

    if (!connectionRequest) {
      throw new HttpError(404, "Connection request not found");
    }

    if (connectionRequest.isStatusUpdatedOnce) {
      throw new HttpError(400, "Request can't update anymore");
    }

    connectionRequest.status = requestType;
    connectionRequest.isStatusUpdatedOnce = true;
    await connectionRequest.save();

    return res.status(200).json({
      success: true,
      message: `Request ${requestType} successfully`,
      updatedRequest: connectionRequest,
    });
  } catch (error) {
    console.log("send connection response error: " + error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getAcceptedRequestsHandler = async (req, res) => {
  try {
    const user = req.user;

    const acceptedRequests = await connectionModel
      .find({
        $or: [{ fromUser: user._id }, { toUser: user._id }],
        status: "accepted",
      })
      .populate("fromUser toUser", "nickName username photoUrl");

    let filteredRequests = [];


    if (acceptedRequests.length > 0) {
      filteredRequests = acceptedRequests.map((request) => {
        const otherUser =
          request.fromUser._id.toString() === user._id.toString()
            ? request.toUser
            : request.fromUser;
        
        return {
          _id: request._id,
          user: {
            _id: otherUser._id,
            nickName: otherUser.nickName,
            username: otherUser.username,
            photoUrl: otherUser.photoUrl,
            message: request.letterMessage,
          },
        };
      });
    }
    console.log(filteredRequests)

    return res.status(200).json({
      success: true,
      message: "Accepted requests fetched successfully",
      connectionRequests: filteredRequests,
    });
  } catch (error) {
    console.log("Get accepted requests error: " + error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export {
  sendConnectionRequestHandler,
  getSendedConnectionRequestsHandler,
  sendConnectionResponseHandler,
  getAcceptedRequestsHandler,
};
