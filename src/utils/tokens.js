import jwt from "jsonwebtoken";

const createAccessToken = (payload) => {
  try {
    // const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      const token = jwt.sign(payload, "Twahanur", {
      expiresIn: "10m",
    });

    return token;
  } catch (error) {
    console.error("Access token creating error: ", error.message);
    return null;
  }
};

const createRefreshToken = (payload) => {
  try {
    // const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    const token = jwt.sign(payload, "Twahanur", {
      expiresIn: "30d",
    });

    return token;
  } catch (error) {
    console.error("Refresh token creating error: ", error.message);
    return null;
  }
};

export { createAccessToken, createRefreshToken };
