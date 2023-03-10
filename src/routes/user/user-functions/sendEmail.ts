import config from '../../../config/config';
import nodemailer from 'nodemailer';
import { IUser } from '../../../models/types/user';
import { catchError } from '../../../coraline/cor-route/crlerror';

const sendEmail = (to: string, url: string, txt: string, user: IUser) => {
  const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.SENDER_EMAIL_ADDRESS,
      pass: config.SENDER_EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: config.SENDER_EMAIL_ADDRESS,
    to: to,
    subject: 'Verify your Bbaby email address',
    html: `
        <div style="display: flex; align-items: center; justify-content: center;">
            <div style="width: 600px;">
              <div style="padding-left: 32px; padding-right: 32px;">
                <div style="padding-top: 16px; padding-bottom: 28px">
                  <div style="padding-bottom: 54px;">
                    <div>
                      
                    </div>
                  </div>
                  <div style="font-size: 16px; line-height: 18px; color: #000000; font-family: Helvetica, Arial, sans-serif; text-align: left; min-width: auto !important; padding-bottom: 34px;">
                    <p>Hi there,</p>
                    <p>Your email address ${user.email} has been added to your ${user.username} Bbaby account, But wait, we're not done yet...</p>
                    <p>To finish verifying your email address and securing your account, click the button below.</p>
                  </div>
                  <div style="padding-bottom: 40px">
                    <div style="border-radius: 4px; font-size: 14px; line-height: 18px; color:#ffffff; font-family: Helvetica, Arial, sans-serif; text-align: center; background-color: rgb(0, 121, 211); width: 214px; min-width: auto !important; margin-right: auto; margin-left: auto;">
                      <a href=${url} target="_blank" style="display: block; padding: 8px; text-decoration: none; color: #ffffff; font-weight: 700;">${txt}</a>
                    </div>
                  </div>
                  <div style="font-size: 16px; line-height: 18px; color: #000000; font-family: Helvetica, Arial, sans-serif; text-align: left; min-width: auto !important; padding-bottom: 28px;">
                    <p>(And don't wait too long. This link will only work for 3 days and you can only use it once.)<p>
                  </div>
                  <div style="font-size: 16px; line-height: 18px; color: #000000; font-family: Helvetica, Arial, sans-serif; text-align: left; min-width: auto !important; padding-bottom: 28px;">
                    <p>Expired link? No worries! To get a new verification email, visit your <a href=${config.CLIENT_URL}/settings/account target="_blank" style="text-decoration: none; color: #006cbf">Account Settings</a>, then hit "Click to resend".</p>
                  </div>
                </div>
              </div>
            </div>
        </div>
        `,
  };

  smtpTransport.sendMail(mailOptions, (err, infor) => {
    if (err) throw catchError(err);
    return infor;
  });
};

export default sendEmail;
