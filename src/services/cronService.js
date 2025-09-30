const cron = require('node-cron');
const User = require('../models/User');
const { sendBirthdayEmail } = require('./emailService');
const logger = require('../config/logger');

// Schedule birthday email job to run daily at 7:00 AM UTC (8:00 AM WAT)
const scheduleBirthdayEmails = () => {
  const cronJob = cron.schedule('0 7 * * *', async () => {
    logger.info('Cron job triggered at:', new Date().toISOString());
    await sendBirthdayEmails();
  }, {
    scheduled: false, // Don't start automatically
    timezone: 'UTC'
  });

  logger.info('Birthday email cron job scheduled for 7:00 AM UTC (8:00 AM WAT) daily');
  return cronJob;
};

// Function to send birthday emails
const sendBirthdayEmails = async () => {
  try {
    logger.info('Starting birthday email cron job');
    
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    logger.info(`Looking for users with birthdays on ${month}/${day}`);

    // Find users whose birthday is today (ignoring year)
    const birthdayUsers = await User.find({
      $expr: {
        $and: [
          { $eq: [{ $month: '$dob' }, month] },
          { $eq: [{ $dayOfMonth: '$dob' }, day] }
        ]
      }
    });

    logger.info(`Found ${birthdayUsers.length} users with birthdays today`);

    if (birthdayUsers.length === 0) {
      logger.info('No birthday users found for today');
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Send birthday emails to all users
    for (const user of birthdayUsers) {
      try {
        await sendBirthdayEmail(user.email, user.username);
        successCount++;
        
        logger.info(`Birthday email sent successfully to ${user.email} (${user.username})`);
        
        // Add a small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        errorCount++;
        errors.push({
          user: user.email,
          username: user.username,
          error: error.message
        });
        
        logger.error(`Failed to send birthday email to ${user.email}`, {
          username: user.username,
          error: error.message
        });
      }
    }

    // Log summary
    logger.info('Birthday email cron job completed', {
      totalUsers: birthdayUsers.length,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    logger.error('Birthday email cron job failed:', error);
  }
};

// Manual trigger for testing
const triggerBirthdayEmails = async () => {
  logger.info('Manually triggering birthday emails...');
  await sendBirthdayEmails();
};

// Get users with birthdays today (for testing)
const getBirthdayUsersToday = async () => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const birthdayUsers = await User.find({
      $expr: {
        $and: [
          { $eq: [{ $month: '$dob' }, month] },
          { $eq: [{ $dayOfMonth: '$dob' }, day] }
        ]
      }
    });

    return birthdayUsers;
  } catch (error) {
    logger.error('Error getting birthday users:', error);
    throw error;
  }
};

// Start the cron job with cloud-friendly configuration
const startCronJob = () => {
  const cronJob = scheduleBirthdayEmails();
  cronJob.start();
  
  logger.info('Birthday email cron job started');
  
  // Log cron job status periodically for cloud monitoring
  setInterval(() => {
    logger.info('Cron job status check - still running');
  }, 3600000); // Every hour
  
  return cronJob;
};

// Stop the cron job
const stopCronJob = (cronJob) => {
  if (cronJob) {
    cronJob.stop();
    logger.info('Birthday email cron job stopped');
  }
};

module.exports = {
  scheduleBirthdayEmails,
  sendBirthdayEmails,
  triggerBirthdayEmails,
  getBirthdayUsersToday,
  startCronJob,
  stopCronJob
};
