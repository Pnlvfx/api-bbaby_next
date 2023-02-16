import config from '../../../config/config';
import nodemailer from 'nodemailer';

const sendEmail = (to: string, url: string, txt: string) => {
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
                  <div style="font-size:16px; line-height:18px; color:#000000; font-family:Helvetica, Arial, sans-serif; text-align:left; min-width:auto !important; padding-bottom: 34px;">
                    <p>Hi there,</p>
                    <p>Your email address has been added to your Bbaby account, But wait, we're not done yet...</p>
                    <p>To finish verifying your email address and securing your account, click the button below.</p>
                  </div>
                  
                  <a href=${url} style="background: rgb(0,121,211); text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${txt}</a>

                  <p>(And don't wait too long. This link will only work for 3 days and you can only use it once.)<p>
              
                  <p>Expired link? No worries! To get a new verification email, visit your <a href=${config.CLIENT_URL}/settings/account>Account Settings</a></p>
              
                  <div>${url}</div>
                </div>
              </div>
            </div>
        </div>
        `,
  };

  smtpTransport.sendMail(mailOptions, (err, infor) => {
    if (err) return err;
    return infor;
  });
};

export default sendEmail;
