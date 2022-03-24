const UserModel = require("../Model/User");
const jwt = require("jsonwebtoken");
const {
  generateToken,
  mailTransport,
  generateMailTemplate,
  plainMailTemplate,
  generateResetTokenTemplate,
} = require("../utils/Mail");
const VerificationModel = require("../Model/Verification");
const { isValidObjectId } = require("mongoose");
const resetTokenModel = require("../Model/resetToken");
const { createRandomBytes, sendError } = require("../utils/Helpers");
exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;
  const User = await UserModel.findOne({ email });
  if (User)
    return res
      .status(400)
      .json({ success: false, error: "User already exists" });
  const newUser = new UserModel({
    name,
    email,
    password,
  });

  const OTP = generateToken();
  const verify = new VerificationModel({
    owner: newUser._id,
    token: OTP,
  });

  await verify.save();
  await newUser.save();

  const newName = newUser.name;

  mailTransport().sendMail({
    from: "emailverification@gmail.com",
    to: newUser.email,
    subject: "Verify your email account",
    html: generateMailTemplate(OTP, newName),
  });

  res.json({success: true,  user: {
    name: newUser.name,
    email: newUser.email,
    id: newUser._id,
    verified: newUser.verified
  },});
};

exports.signIn = async (req, res) => {
  try {
    
    const { email, password } = req.body;
    if (!email.trim() || !password.trim()) 
     return sendError(res, "email/password missing")
    // User
    const user = await UserModel.findOne({ email });
    if (!user) return sendError(res, "User not found");
    // Compare
    const isMatched = await user.comparePassword(password);
    if (!isMatched)
    return sendError(res, "email/password does not match");
  
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,  
        id: user.user_id,
        token: token, 
      },
    });
  } catch (error) {
    sendError(res, error.message, 500)
  }
}; 

exports.verifyEmail = async (req, res) => {
  const { userId, otp } = req.body; 
  if (!userId || !otp.trim())
    return res.status(400).json({
      success: false,
      error: "incorrect code",
    });
  if (!isValidObjectId(userId))
    return res.status(400).json({
      success: false,
      error: "incorrect object id",
    });
  const user = await UserModel.findById(userId);
  if (!user)
    return res.status(400).json({
      success: false,
      error: "user is not found",
    });
  if (user.verified)
    return res.status(400).json({
      success: false,
      error: "This account is already verified",
    });
  const token = await VerificationModel.findOne({ owner: user._id });
  if (!token)
    return res.status(400).json({
      success: false,
      error: "User not found",
    });
  const isMatched = await token.compareToken(otp);
  if (!isMatched)
    return res.status(400).json({
      success: false,
      error: "Please provide a valid token",
    });
  user.verified = true;
  await VerificationModel.findByIdAndDelete(token._id);
  await user.save();

  const name = user.name;

  mailTransport().sendMail({
    from: "emailverification@gmail.com",
    to: user.email,
    subject: "Verify your email account",
    html: plainMailTemplate(
      "Email Verified Successfully",
      "Thanks for connecting with us",
      name
    ),
  });
  res.json({
    success: false,
    message: "Email Verified Successfuly",
    user: {
      name: user.name,
      email: user.email,
      verified: user.verified,
      id: user.user_id,
    },
  });
};

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({
      success: false, error: "Please provide a valid email address",
    });
  const user = await UserModel.findOne({ email });
  if (!user)
    return res.status(400).json({
      success: false, error: "User not found",
    });
  const ownerToken = await resetTokenModel.findOne({ owner: user._id });
  if (ownerToken)
    return res.status(400).json({
      success: false, message: "Expires In an hour and new token can genetrated",
    });

  const ranToken = await createRandomBytes();

  const resetToken = new resetTokenModel({ owner: user._id, token: ranToken });

  await resetToken.save();

  const name = user.name;

  mailTransport().sendMail({
    from: "emailverification@gmail.com",
    to: user.email,
    subject: "Password Reset",
    html: generateResetTokenTemplate(
      name,
      `http://localhost:3000/reset-password?token=${ranToken}&id=${user._id}`
    ), 
  });
  res.json({
    success: true,
    message: "Password Reset Link sent to your email",
  });
};

exports.resetPassword = async (req, res) => {
  const { password } = req.body;
  const user = await UserModel.findById(req.user._id);
  if (!user)
    return res.status(400).json({
      success: false, error: "User not found",
    });
  const isMatched = await user.comparePassword(password);
  if (isMatched)
    return res.status(400).json({ success: false, message: "New Password must be different" });

  if (password.trim().length < 8 || password.trim().length > 20)
    return res
      .status(400)
      .json({ success: false, error: "Password  must be at least 8 - 20 characters long" });

  user.password = password.trim();
  await user.save();

  await resetTokenModel.findOne({ owner: user._id });

  const name = user.name;

  mailTransport().sendMail({
    from: "emailverification@gmail.com",
    to: user.email,
    subject: "Reset Password Successfully",
    html: plainMailTemplate(
      "Password reset Successfully",
      "Now you can login with your new password",
      name
    ),
  });

  res.json({ success: true, message: "Reset Password Successfully" });
};
