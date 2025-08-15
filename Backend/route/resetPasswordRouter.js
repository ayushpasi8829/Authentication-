const express = require("express");
const router = express.Router();
const resetPasswordController = require("../controller/resetPasswordController");

router.post("/sendMail", resetPasswordController.sendMailtouser);
router.get("/verify", resetPasswordController.verifyResetRequest);
router.post("/resetPassword", resetPasswordController.updatePassword);

module.exports = router;
