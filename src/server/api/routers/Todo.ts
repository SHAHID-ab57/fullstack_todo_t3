import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const todoRouter = createTRPCRouter({
  // Fetch all todos
  all: publicProcedure.query(async ({ ctx }) => {
    try {
      const todos = await ctx.db.todo.findMany();
      return todos;
    } catch (error) {
      throw new Error("Failed to fetch todos");
    }
  }),

  create: publicProcedure
  .input(
    z.object({
      title: z.string(),
      completed: z.boolean().default(false),
      userId: z.number(), // Ensure userId is passed
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.todo.create({
        data: {
          title: input.title,
          completed: input.completed,
          userId: input.userId, // Directly setting userId
        },
      });
    } catch (error) {
      console.error("Error creating todo:", error);
      throw new Error("Failed to create todo");
    }
  }),

  // Delete a todo (fix: expects a number)
  delete: publicProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
    return ctx.db.todo.delete({
      where: { id: input },
    });
  }),

  // Toggle a todo's completion status
  toggle: publicProcedure
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.todo.update({
        where: { id: input.id },
        data: { completed: input.completed },
      });
    }),

  // Edit a todo title
  edit: publicProcedure
    .input(z.object({ id: z.number(), title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.todo.update({
        where: { id: input.id },
        data: { title: input.title },
      });
    }),
});
