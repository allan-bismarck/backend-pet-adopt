"use strict";
require('dotenv').config({ path: '.env.cred' });
const nodemailer = require("nodemailer");

const { readUserById } = require('../db_manager/db_client_user_mongo');
const { readAnimalById } = require('../db_manager/db_client_animals');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 20000,
});

async function sendEmails(ngoName, subject, text, html, destinationEmail) {
  try {
    const info = await transporter.sendMail({
      from: `${ngoName} via Disparador de e-mails" <${process.env.EMAIL_USER}}>`,
      to: `${destinationEmail}, allanbismarck95@gmail.com1`,
      subject: subject,
      text: text,
      html: html,
    });
  
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log(error);
  }
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  //
  // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
  //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
  //       <https://github.com/forwardemail/preview-email>
  //
}

module.exports = {
    sendEmails
};