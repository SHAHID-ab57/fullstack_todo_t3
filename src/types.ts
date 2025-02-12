import {z} from "zod";

export const todoInput = z.string({
    required_error: "Title is required",
})
.min(1)
.max(20)