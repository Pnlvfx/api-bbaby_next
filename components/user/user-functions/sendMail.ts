import config from '../../../config/config'
import nodemailer from 'nodemailer'
import { OAuth2Client } from 'google-auth-library';

const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground'

const {
    MAILING_SERVICE_CLIENT_ID,
    MAILING_SERVICE_CLIENT_SECRET,
    MAILING_SERVICE_REFRESH_TOKEN,
    SENDER_EMAIL_ADDRESS
} = config

const oauth2Client = new OAuth2Client(
    MAILING_SERVICE_CLIENT_ID,
    MAILING_SERVICE_CLIENT_SECRET,
    OAUTH_PLAYGROUND
)

const sendEMail = (to:string,url:string,txt:string) => {
    oauth2Client.setCredentials({
        refresh_token: MAILING_SERVICE_REFRESH_TOKEN
    })
    const accessToken = oauth2Client.getAccessToken()
    const smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: SENDER_EMAIL_ADDRESS,
            clientId: MAILING_SERVICE_CLIENT_ID,
            clientSecret: MAILING_SERVICE_CLIENT_SECRET
        }
    })

    const mailOptions = {
        from: SENDER_EMAIL_ADDRESS,
        to: to,
        subject: "Verify your Bbaby email address",
        html: `
        <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
            <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to Bbabystyle.</h2>
            <p>Hi there,</p>
            <p>Your email address has been added to your Bbaby account, But wait, we're not done yet...</p>
            <p>To finish verifying your email address and securing your account, click the button below.</p>
            
            <a href=${url} style="background: rgb(0,121,211); text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${txt}</a>

            <p>(And don’t wait too long. This link will only work for 3 days and you can only use it once.)<p>
        
            <p>If the button doesn't work for any reason, you can also click on the link below:</p>
        
            <div>${url}</div>
        </div>
        `
    }

    smtpTransport.sendMail(mailOptions, (err,infor) => {
        if (err) return err;
        return infor
    })
}

export default sendEMail;