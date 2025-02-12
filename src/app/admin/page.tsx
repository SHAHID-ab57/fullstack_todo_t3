"use client";

import { api } from "~/trpc/react";
import Swal from "sweetalert2";

export default function AdminDashboard() {
  const utils = api.useUtils();
  
  // Fetch todos
  const { data: todos, isLoading, error } = api.todo.all.useQuery();

  // Delete todo mutation
  const deleteTodo = api.todo.delete.useMutation({
    onSuccess: () => {
      utils.todo.all.invalidate();
      Swal.fire("Deleted", "Todo deleted successfully!", "success");
    },
  });

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTodo.mutate(id);
      }
    });
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>
      
      {isLoading && <p>Loading todos...</p>}
      {error && <p className="text-red-500">Error loading todos</p>}
      
      <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">All Todos</h2>
        <ul className="space-y-2">
          {todos?.map((todo) => (
            <li key={todo.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
              <span className={todo.completed ? "line-through text-gray-400" : "text-white"}>{todo.title}</span>
              <button
                onClick={() => handleDelete(todo.id)}
                className="bg-red-500 px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
