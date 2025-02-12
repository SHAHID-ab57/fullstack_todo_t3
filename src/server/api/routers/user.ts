import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import bcrypt from "bcryptjs";

export const userRouter = createTRPCRouter({
  // Create a new user (password is hashed before saving)
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await bcrypt.hash(input.password, 10);

      return ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword, // Store hashed password
        },
      });
    }),

  // Get a user by ID (includes their todos)
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.user.findUnique({
        where: { id: input.id },
        include: { todos: true },
      });
    }),

  // Get all users (includes their todos)
  all: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      include: { todos: true },
    });
  }),

  // Delete a user by ID
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.delete({
        where: { id: input.id },
      });
    }),
});
