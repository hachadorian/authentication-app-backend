import nodemailer from "nodemailer";
import mg from "nodemailer-mailgun-transport";
import dotenv from "dotenv";

export const sendEmail = async (to, html) => {
  dotenv.config();
  const mailgunAuth = {
    auth: {
      api_key: process.env.EMAIL_KEY,
      domain: process.env.EMAIL_DOMAIN,
    },
  };

  let transporter = nodemailer.createTransport(mg(mailgunAuth));

  const mailOptions = {
    from: "authenticationapp@resetpassword.com",
    to: to,
    subject: "Reset Password",
    html: html,
  };

  transporter.sendMail(mailOptions, (error, res) => {
    if (error) {
      console.log(error);
    } else {
      console.log(res);
    }
  });
};
