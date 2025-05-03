import mongoose from "mongoose";
import bcrypt from "bcrypt";
import HttpError from "../utils/errorClass.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      minLength: 3,
      maxLength: 30,
      trim: true,
    },

    isUsernameChangedOnce: {
      type: Boolean,
      default: false,
    },

    nickName: {
      type: String,
      maxLength: 30,
      trim: true,
      validate: (value) => {
        if (value.length > 0 && value.length < 3) {
          throw new HttpError(
            400,
            "Nickname must be atleast 3 characters long"
          );
        }
      },
    },

    email: {
      type: String,
      unique: true,
      required: true,
      minLength: 10,
      maxLength: 50,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minLength: 8,
    },

    age: {
      type: Number,
      required: true,
      min: 13,
    },

    gender: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new HttpError(400, "Gender must be male, female or others");
        }
      },
    },

    bio: {
      type: String,
      trim: true,
      maxLength: 500,
      default: "",
    },

    photoUrl: {
      type: String,
      trim: true,
      default: function () {
        if (this.gender === "male") {
          return "https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-622.jpg?w=740";
        } else if (this.gender === "female") {
          return "https://img.freepik.com/free-vector/flat-style-woman-avatar_90220-2944.jpg?t=st=1734156891~exp=1734160491~hmac=a1a09b51bfc2758d2fe7df72e5d7d6585d90b417dbf88ed415c10c25443de1f3&w=740";
        } else {
          return "https://cdn.vectorstock.com/i/500p/48/31/emo-avatar-vector-4304831.jpg";
        }
      },
    },

    interests: {
      type: [String],
      default: [],
    },

    genderPreference: {
      type: String,
      enum: {
        values: ["male", "female", "both"],
        message: "Only 'male', 'female' and 'both' are allowed as a preference",
      },
      default: "both",
    },

    agePreference: {
      type: Object,
      default: function (value) {
        return this.age >= 18
          ? { fromAge: 18, toAge: 30 }
          : { fromAge: 13, toAge: 17 };
      },
    },

    languages: {
      type: [String],
      default: [],
    },

    talkRollPoints: {
      type: Number,
      default: 0,
      max: 9999999,
    },
  },
  { timestamps: true }
);

userSchema.index({ gender: 1, age: 1 });

userSchema.methods.validatePassword = async function (userInputPassword) {
  const isValidPassword = await bcrypt.compare(
    userInputPassword,
    this.password
  );

  return isValidPassword;
};

const User = mongoose.model("User", userSchema);
export default User;
