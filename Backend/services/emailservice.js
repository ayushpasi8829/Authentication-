const nodemailer = require("nodemailer");

const sendEmail = async ({ recipientEmail, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `<${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: subject,
      text: message,
      html: `<p>${message}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: "Email sent successfully!",
      info: info.response,
    };
  } catch (error) {
    throw new Error("Failed to send email: " + error.message);
  }
};

module.exports = { sendEmail };
