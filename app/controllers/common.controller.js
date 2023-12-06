const config = require('../config/config');
const nodemailer = require("nodemailer");

function sendMail1(params) {
    
        params.site_url = config.site_url;
        params.admin_mail = config.admin_mail;
        params.site_name = config.site_name;

        var smtpTransport = nodemailer.createTransport({
            host: config.senderHost,
            port: config.senderPort,
            secure: false, // true for 465, false for other ports
            auth: {
                user: config.senderUsername,
                pass: config.senderPassword
            }
        });

        var mail = {
            from: config.senderFrom,
            to: params.to,
            subject: params.subject,
            html: params.html
        }

        smtpTransport.sendMail(mail, function(error, response) {
            smtpTransport.close();
            if (response) {
                return true; 
            } else {
                return false ; 
            }           
        });

}

exports.sendMail1 = sendMail1;
