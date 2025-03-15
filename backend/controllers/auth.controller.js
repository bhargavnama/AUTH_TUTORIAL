import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { User } from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendResetEmailSuccess, sendResetPasswordEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name) {
      throw new Error("All Fields are required");
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = Math.floor(
      Math.random() * 900000 + 100000
    ).toString();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, //24 hours
    });

    await user.save();

    // jwt
    generateTokenAndSetCookie(res, user._id);

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error in signup controller: ", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res
      .status(200)
      .json({ success: true, user: { ...user._doc, password: undefined } });
  } catch (error) {
    console.log("Error in verifying email: ", error);
  }

};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if(!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required"});
    }

    const user = await User.findOne({email});

    if(!user){
      return res.status(400).json({success: false, message: "Invalid credentials"});
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if(!isPasswordValid) {
      return res.status(400).json({success: false, message: "Invalid credentials"});
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();

    res.status(200).json({success: true, message: "Logged in successfully", user: { ...user._doc, password: undefined }});
  } catch (error) {
    console.log('Error in login controller: ', error);
    res.status(500).json({success: false, message: "Internal server error"});
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({success: true, message: "Logged out successfully"});
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({email});

    if(!user) {
      return res.status(400).json({success: false, message: "User not found"});
    }
    
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    await sendResetPasswordEmail(email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

    res.status(200).json({success: true, message: "Password reset link is successfully sent to your email."});
  } catch (error) {
    console.log('Error in forget password: ', error);
    res.status(500).json({success: false, message: error.message});
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() }
    });

    if(!user) {
      return res.status(400).json({success: false, message: "Invalid or expired reset token"});
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetEmailSuccess(user.email);

    res.status(200).json({success: true, message: "Password reset successfully."});
  } catch (error) {
    console.log('Error in reset password: ', error);
    res.status(500).json({success: false, message: "Internal server error"});
  }
}

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if(!user) {
      return res.status(404).json({success: false, message: "User not found"});
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.log('Error in check auth controller: ', error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}