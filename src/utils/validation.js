import validator from "validator";
import HttpError from "./errorClass.js";
import { languagesList, interestsList } from "../utils/constants.js";

const validateSignupData = (req) => {
  const { username, email, password, age, gender } = req.body;

  const sanitizedFields = ["username", "email", "password", "age", "gender"];

  Object.keys(req.body).forEach((field) => {
    if (!sanitizedFields.includes(field)) {
      throw new HttpError(400, `Invalid Field: ${field}`);
    }
  });

  // Validate username
  if (!username || !validator.isLength(username, { min: 4, max: 30 })) {
    throw new HttpError(
      400,
      "Username length must be between 4 and 30 characters"
    );
  }
  if (!validator.isAlphanumeric(username)) {
    throw new HttpError(400, "Username must contain only letters and numbers");
  }

  // Validate email
  if (!email || !validator.isEmail(email)) {
    throw new HttpError(400, "Please enter a valid email");
  }

  // Validate password
  if (!password || !validator.isLength(password, { min: 8 })) {
    throw new HttpError(400, "Password must be at least 8 characters long");
  }
  if (!validator.isStrongPassword(password)) {
    throw new HttpError(
      400,
      "Password must contain lowercase, uppercase, number or symbol"
    );
  }

  // Validate age (optional example)
  if (!age) throw new HttpError(400, "Please enter a age");
  if (age && !validator.isInt(age.toString(), { min: 13 })) {
    throw new HttpError(400, "Age must be 13");
  }

  // Validate gender (optional example)
  const validGenders = ["male", "female", "others"];
  if (gender && !validGenders.includes(gender.toLowerCase())) {
    throw new HttpError(400, "Please enter a valid gender");
  }
};

const validateProfileEditData = (req) => {
  const {
    nickName,
    bio,
    interests,
    genderPreference,
    agePreference,
    languages,
  } = req.body;
  const { age } = req.user;

  const sanitizedFields = [
    "nickName",
    "bio",
    "interests",
    "genderPreference",
    "agePreference",
    "languages",
  ];

  //Sanitizing the data
  Object.keys(req.body).forEach((field) => {
    if (!sanitizedFields.includes(field)) {
      throw new HttpError(400, `Invalid field: ${field}`);
    }
  });

  //Nickname validation
  if (nickName.length > 0 && nickName.length < 3) {
    throw new HttpError(400, "Nickname must be atleast 3 characters long");
  }

  //Bio Validation
  if (bio.length > 500) {
    throw new HttpError(400, "Bio must be less than 500 characters");
  }

  //Interests length validation
  if (interests.length > 5) {
    throw new HttpError(400, "Only five interests can add");
  }

  interests.forEach((interest) => {
    if (!interestsList.includes(interest)) {
      throw new HttpError(400, `Invalid interest: ${interest}`);
    }
  });

  //Gender preference validation
  if (!["male", "female", "both"].includes(genderPreference)) {
    throw new HttpError(
      400,
      "Only 'male', 'female', 'both' are allowed as gender preference"
    );
  }

  //Age preference validation
  if (!agePreference.fromAge || !agePreference.toAge) {
    throw new HttpError(400, "From and To Age are required");
  }
  if (age >= 18) {
    if (
      agePreference.fromAge < 18 ||
      agePreference.fromAge > 60 ||
      agePreference.toAge < 18 ||
      agePreference.toAge > 60
    ) {
      throw new HttpError(400, "Age preferences must be between 18 to 60");
    }
  } else {
    if (
      agePreference.fromAge < 13 ||
      agePreference.fromAge > 17 ||
      agePreference.toAge < 13 ||
      agePreference.toAge > 17
    ) {
      throw new HttpError(400, "Age preference must be between 13 to 17");
    }
  }

  //Language validation
  if (languages.length > 5) {
    throw new HttpError(400, "Only five languages can add");
  }

  languages.forEach((language) => {
    if (!languagesList.includes(language)) {
      throw new HttpError(400, `Invalid language: ${language}`);
    }
  });
};

export { validateSignupData, validateProfileEditData };
