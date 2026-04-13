import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { PrismaClient } from '@ps/db';

const prisma = new PrismaClient();

export const noteRouter = router({
  // Get all notes for the current user
  getNotes: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return prisma.note.findMany({
        where: {
          userId: ctx.user.id,
          deletedAt: null,
          ...(input?.search ? {
            OR: [
              { title: { contains: input.search, mode: 'insensitive' } },
              { plainText: { contains: input.search, mode: 'insensitive' } },
            ]
          } : {}),
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  // Create a new note
  createNote: protectedProcedure
    .input(z.object({
      title: z.string().optional(),
      content: z.any().optional(),
      plainText: z.string().optional(),
      contactId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { title, content, plainText, contactId } = input;
      // @ts-ignore - Failsafe to bypass persistent Prisma/TS inference conflict
      return prisma.note.create({
        data: {
          title,
          content: content ?? {},
          plainText,
          contactId,
          userId: ctx.user.id,
        },
      });
    }),

  // Update a note
  updateNote: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      title: z.string().optional(),
      content: z.any().optional(),
      plainText: z.string().optional(),
      contactId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, title, content, plainText, contactId } = input;
      return prisma.note.update({
        where: { id, userId: ctx.user.id },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(content !== undefined ? { content } : {}),
          ...(plainText !== undefined ? { plainText } : {}),
          ...(contactId !== undefined ? { contactId } : {}),
        },
      });
    }),

  // Delete a note
  deleteNote: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.note.update({
        where: { id: input.id, userId: ctx.user.id },
        data: { deletedAt: new Date() },
      });
    }),
});
