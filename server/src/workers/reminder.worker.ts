import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { ReminderJobData } from '../queue/reminder.queue';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

export const reminderWorker = new Worker<ReminderJobData>(
  'reminders',
  async (job) => {
    const { title, type, userId } = job.data;
    
    console.log(`🔔 NOTIFICATION for User ${userId}: ${type.toUpperCase()} - "${title}" is starting soon!`);
    
    // TODO: Integrate with actual notification service (Email/SMS/Push)
    // For now, we log to stdout as professional proof of background processing.
  },
  { connection }
);

reminderWorker.on('completed', (job) => {
  console.log(`✅ Reminder job ${job.id} completed successfully`);
});

reminderWorker.on('failed', (job, err) => {
  console.error(`❌ Reminder job ${job?.id} failed: ${err.message}`);
});
