import { Queue } from 'bullmq';
import { redisConnection } from './connection';

export const reminderQueue = new Queue('reminders', { connection: redisConnection });

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
