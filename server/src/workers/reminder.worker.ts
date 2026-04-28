import { Worker } from 'bullmq';
import { ReminderJobData } from '../queue/reminder.queue';
import { redisConnection } from '../queue/connection';
import prisma from '../shared/prisma';

export const reminderWorker = new Worker<ReminderJobData>(
  'reminders',
  async (job) => {
    const { title, type, userId } = job.data;
    
    console.log(`🔔 NOTIFICATION for User ${userId}: ${type.toUpperCase()} - "${title}" is starting soon!`);
    
    // Fetch push tokens for the user
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    });

    if (subscriptions.length === 0) {
      console.log(`⚠️ No push subscriptions found for user ${userId}. skipping push.`);
      return;
    }

    console.log(`📱 Sending push to ${subscriptions.length} devices for user ${userId}...`);
    
    // TODO: Send to FCM via firebase-admin or direct HTTP
    // For now, we log the tokens we would send to as proof of wiring.
    for (const sub of subscriptions) {
      console.log(`   -> Target: ${sub.platform} (${sub.endpoint.slice(0, 10)}...)`);
    }
  },
  { connection: redisConnection }
);

reminderWorker.on('completed', (job) => {
  console.log(`✅ Reminder job ${job.id} completed successfully`);
});

reminderWorker.on('failed', (job, err) => {
  console.error(`❌ Reminder job ${job?.id} failed: ${err.message}`);
});
