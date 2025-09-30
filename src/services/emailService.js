const sgMail = require('@sendgrid/mail');
const logger = require('../config/logger');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Generate HTML email template
const generateBirthdayEmailTemplate = (username) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Happy Birthday!</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .container {
                background: white;
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                max-width: 600px;
                width: 100%;
            }
            h1 {
                color: #333;
                font-size: 2.5em;
                margin-bottom: 20px;
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .message {
                font-size: 1.2em;
                color: #666;
                line-height: 1.6;
                margin: 20px 0;
            }
            .birthday-image {
                max-width: 100%;
                height: auto;
                border-radius: 15px;
                margin: 30px 0;
                box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #f0f0f0;
                color: #999;
                font-size: 0.9em;
            }
            .celebration {
                font-size: 3em;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="celebration">🎉🎂🎊</div>
            <h1>Happy Birthday, ${username}!</h1>
            
            <div class="message">
                <p>Wishing you a fantastic day filled with joy, laughter, and wonderful memories!</p>
                <p>May this new year of your life bring you happiness, success, and all the things that make you smile.</p>
                <p>Have an amazing birthday celebration! 🎈</p>
            </div>
            
            <div class="footer">
                <p>🎈 Best wishes from Us! 🎈</p>
                <p>This email was sent automatically to celebrate your special day.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send birthday email
const sendBirthdayEmail = async (email, username) => {
  try {
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Birthday Wisher'
      },
      subject: `🎉 Happy Birthday, ${username}! 🎂`,
      html: generateBirthdayEmailTemplate(username),
      text: `Happy Birthday, ${username}!\n\nWishing you a fantastic day filled with joy, laughter, and wonderful memories!\n\nBest wishes!`
    };

    const response = await sgMail.send(msg);
    
    logger.info('Birthday email sent successfully', {
      to: email,
      username: username,
      messageId: response[0].headers['x-message-id']
    });

    return {
      success: true,
      messageId: response[0].headers['x-message-id'],
      to: email,
      username: username
    };

  } catch (error) {
    logger.error('Failed to send birthday email', {
      to: email,
      username: username,
      error: error.message
    });
    
    throw new Error(`Failed to send birthday email to ${email}: ${error.message}`);
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  try {
    // Test SendGrid API key by sending a test email to ourselves
    const testMsg = {
      to: process.env.SENDGRID_FROM_EMAIL,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Birthday Wisher Test'
      },
      subject: 'SendGrid Configuration Test',
      text: 'This is a test email to verify SendGrid configuration.'
    };
    
    await sgMail.send(testMsg);
    logger.info('SendGrid configuration is valid');
    return true;
  } catch (error) {
    logger.error('SendGrid configuration test failed:', error);
    return false;
  }
};

module.exports = {
  sendBirthdayEmail,
  testEmailConfiguration,
  generateBirthdayEmailTemplate
};