import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: "String",
      enum: {
        values: ["send", "accepted", "rejected"],
        message: "Status must be 'send', 'accepted', or 'rejected'.",
      },
    },

    isStatusUpdatedOnce: {
      type: Boolean,
      default: false,
    },

    letterMessage: {
      type: String,
      required: true,
      minLength: 30,
      maxLength: 1111,
    },
  },
  { timestamps: true }
);

connectionSchema.index({ fromUser: 1, toUser: 1 });

const Connection = mongoose.model("Connection", connectionSchema);
export default Connection;
