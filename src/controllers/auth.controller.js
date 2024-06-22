const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Users } = require("../models");

const register = async (req, res, _next) => {
  const { fullname, email, phone, address, username, password } = req.body;
  try {
    if (!fullname || !email || !phone || !address || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all fields",
      });
    }

    // check existing email and user
    const existingUser = await Users.findOne({ where: { username } });
    const existingEmail = await Users.findOne({ where: { email } });

    if (existingUser || existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Users.create({
      fullname,
      email,
      phone,
      address,
      username,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: `User ${user.username} created successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res, _next) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username or password is required",
      });
    }

    const user = await Users.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        address: user.address,
        username: user.username,
      },
      process.env.JWT_SECRET
    );

    return res.status(200).json({
      success: true,
      message: `Login successful for ${user.username}`,
      data: {
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
};
