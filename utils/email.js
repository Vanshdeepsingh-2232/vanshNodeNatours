const { format } = require('morgan');
const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `"VanshdeepSingh" <anshdeepkaur606@gmail.com>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      console.log('PRODUCTION_MAIL_GOT HIT');
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    } else {
      return nodemailer.createTransport({
        host: 'sandbox.smtp.mailtrap.io',
        port: 2525,
        auth: {
          user: process.env.MailTrap_User,
          pass: process.env.MailTrap_Pass,
        },
      });
    }
  }
  async send(template, subject) {
    //send the actual email

    //1) render the html based on the pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    //2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.toString(html),
    };

    //3) Create a transport and Send Email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('Welcome', 'Wecome To The NATOURS Family!!');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Your Password Reset Token!');
  }
};
