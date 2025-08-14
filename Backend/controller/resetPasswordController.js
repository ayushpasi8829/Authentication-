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
    const requestId = uuid.v4();
    const { email } = req.body;
    const recepientEmail = await UserModel.findOne({ where: { email: email } });
    // console.log(recepientEmail);
    if (!recepientEmail) {
      return res
        .status(404)
        .json({ message: "Please provide the registered email!" });
    }
    const resetRequest = await ResetPassword.create({
      id: requestId,
      isActive: true,
      userId: recepientEmail.dataValues.id,
    });

    await sendEmail({
      recipientEmail: email,
      subject: "Reset Password Request",
      message: `Please follow the link to reset your password: http://localhost:3000/password/${requestId}?id=${recepientEmail.id}`,
    });

    return res.status(200).json({
      message:
        "Link for reset the password is successfully send on your Mail Id!",
    });
  } catch (error) {
    console.log(error);
    return res.status(409).json({ message: "failed changing password" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const requestId = req.body.requestId;
    // console.log(">>>>>>", requestId);
    const userId = req.body.userId;
    const password = req.body.password;
    const checkResetRequest = await ResetPassword.findAll({
      where: { id: requestId, isActive: true },
    });

    const result = await ResetPassword.update(
      { isActive: false },
      { where: { id: requestId } }
    );
    console.log(result);
    if (result == 1) {
      const newPassword = await hashPassword(password);
      await UserModel.update(
        { password: newPassword },
        { where: { id: userId } }
      );
      res.status(201).json({ message: "Successfuly update the new password" });
    }
  } catch (error) {
    return res.status(403).json({ error, success: false });
  }
};

module.exports = {
  sendMailtouser,
  updatePassword,
};
