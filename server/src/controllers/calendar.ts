import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { PrismaClient, EventPriority, EventStatus } from '@ps/db';

const prisma = new PrismaClient();

// Explicitly define schemas to help TS inference in some IDE environments
const eventInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  isAllDay: z.boolean().default(false),
  priority: z.nativeEnum(EventPriority).default(EventPriority.medium),
  status: z.nativeEnum(EventStatus).default(EventStatus.confirmed),
  googleEventId: z.string().optional(),
});

const eventUpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  isAllDay: z.boolean().optional(),
  priority: z.nativeEnum(EventPriority).optional(),
  status: z.nativeEnum(EventStatus).optional(),
  googleEventId: z.string().optional(),
});

export const calendarRouter = router({
  // Get all events for the current user
  getEvents: protectedProcedure
    .input(z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return prisma.event.findMany({
        where: {
          userId: ctx.user.id,
          ...(input?.startDate || input?.endDate ? {
            startAt: {
              ...(input.startDate ? { gte: new Date(input.startDate) } : {}),
              ...(input.endDate ? { lte: new Date(input.endDate) } : {}),
            }
          } : {}),
        },
        orderBy: { startAt: 'asc' },
      });
    }),

  // Create a new event
  createEvent: protectedProcedure
    .input(eventInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { startAt, endAt, ...rest } = input;
      return prisma.event.create({
        data: {
          ...rest,
          userId: ctx.user.id,
          startAt: new Date(startAt),
          endAt: new Date(endAt),
        },
      });
    }),

  // Update an existing event
  updateEvent: protectedProcedure
    .input(eventUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, startAt, endAt, ...data } = input;
      
      // Ensure the event belongs to the user
      const existing = await prisma.event.findFirst({
        where: { id, userId: ctx.user.id }
      });

      if (!existing) {
        throw new Error('Event not found or unauthorized');
      }

      return prisma.event.update({
        where: { id },
        data: {
          ...data,
          ...(startAt ? { startAt: new Date(startAt) } : {}),
          ...(endAt ? { endAt: new Date(endAt) } : {}),
        },
      });
    }),

  // Delete an event
  deleteEvent: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.event.deleteMany({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      });
    }),
});
