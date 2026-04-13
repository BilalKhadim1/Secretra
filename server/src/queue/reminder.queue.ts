import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

export const reminderQueue = new Queue('reminders', { connection });

export interface ReminderJobData {
  userId: string;
  title: string;
  type: 'event' | 'task';
  scheduledTime: string;
}

export async function scheduleReminder(data: ReminderJobData) {
  const delay = new Date(data.scheduledTime).getTime() - Date.now();
  
  if (delay > 0) {
    await reminderQueue.add(`${data.type}-reminder-${data.userId}`, data, {
      delay,
      removeOnComplete: true,
    });
  }
}
