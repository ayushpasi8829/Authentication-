const path = require("path");
const UserModel = require("../model/userModel");
const uuid = require("uuid");
const ResetPassword = require("../model/resetPasswordModel");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../services/emailservice");

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const sendMailtouser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const recepientEmail = await UserModel.findOne({ where: { email: email } });

    if (!recepientEmail) {
      return res
        .status(404)
        .json({ message: "Please provide the registered email!" });
    }

    const requestId = uuid.v4();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    try {
      await ResetPassword.destroy({
        where: { userId: recepientEmail.id },
      });
    } catch (destroyError) {
      console.error("Error deleting reset password record:", destroyError);
      return res
        .status(500)
        .json({ message: "Failed to delete existing reset password records" });
    }

    await ResetPassword.create({
      id: requestId,
      userId: recepientEmail.id,
      expiresAt: expiresAt,
      isActive: true,
    });

    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/password/${requestId}`;

    await sendEmail({
      recipientEmail: email,
      subject: "Reset Password Request",
      message: `Please follow the link to reset your password: ${resetUrl}\n\nThis link will expire in 5 minutes.\n\nIf you did not request this, please ignore this email.`,
    });

    return res.status(200).json({
      message:
        "Link for reset the password is successfully send on your Mail Id!",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to process password reset request" });
  }
};

const verifyResetRequest = async (req, res) => {
  try {
    const { requestId } = req.query;

    if (!requestId) {
      return res.status(400).json({ message: "Invalid or missing request ID" });
    }

    const resetRequest = await ResetPassword.findOne({
      where: {
        id: requestId,
        isActive: true,
      },
    });

    if (!resetRequest) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    if (new Date() > resetRequest.expiresAt) {
      await ResetPassword.update(
        { isActive: false },
        { where: { id: resetRequest.id } }
      );
      return res.status(400).json({ message: "Reset link has expired" });
    }

    return res.status(200).json({
      message: "Request is valid",
      userId: resetRequest.userId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to verify request" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { requestId, password, confirmPassword } = req.body;

    if (!requestId || !password || !confirmPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const resetRequest = await ResetPassword.findOne({
      where: {
        id: requestId,
        isActive: true,
      },
    });
    console.log(JSON.stringify(resetRequest));
    if (!resetRequest) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    if (new Date() > resetRequest.expiresAt) {
      await ResetPassword.update(
        { isActive: false },
        { where: { id: resetRequest.id } }
      );
      return res.status(400).json({ message: "Reset link has expired" });
    }

    const newPassword = await hashPassword(password);

    await UserModel.update(
      { password: newPassword },
      { where: { id: resetRequest.userId } }
    );

    await ResetPassword.update(
      { isActive: false },
      { where: { id: resetRequest.id } }
    );

    res.status(200).json({ message: "Successfully updated the new password" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update password" });
  }
};

module.exports = {
  sendMailtouser,
  verifyResetRequest,
  updatePassword,
};
