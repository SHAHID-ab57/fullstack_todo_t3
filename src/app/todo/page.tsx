"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import Swal from "sweetalert2";

export default function Home() {
  const [newTodo, setNewTodo] = useState("");
  const [editingTodo, setEditingTodo] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [draggedTodo, setDraggedTodo] = useState<number | null>(null);

  const utils = api.useUtils();

  // Fetch todos
  const { data: todos, isLoading, error } = api.todo.all.useQuery();

  // Mutations
  const createTodo = api.todo.create.useMutation<any>({
    onSuccess: () => {
      utils.todo.all.invalidate();
      setNewTodo("");
      Swal.fire("Success", "Todo added successfully!", "success");
    },
    onError: () => {
      Swal.fire("Error", "Failed to add todo. Please try again.", "error");
    },
  });

  const deleteTodo = api.todo.delete.useMutation<any>({
    onSuccess: () => {
      utils.todo.all.invalidate();
      Swal.fire("Deleted", "Todo deleted successfully!", "success");
    },
    onError: () => {
      Swal.fire("Error", "Failed to delete todo.", "error");
    },
  });

  const toggleTodo = api.todo.toggle.useMutation<any>({
    onSuccess: () => utils.todo.all.invalidate(),
    onError: () => {
      Swal.fire("Error", "Failed to toggle todo status.", "error");
    },
  });

  const editTodo = api.todo.edit.useMutation<any>({
    onSuccess: () => {
      utils.todo.all.invalidate();
      setEditingTodo(null);
      setEditText("");
      Swal.fire("Updated", "Todo updated successfully!", "success");
    },
    onError: () => {
      Swal.fire("Error", "Failed to update todo.", "error");
    },
  });

  const handleAddTodo = () => {
    if (!newTodo.trim()) {
      Swal.fire("Error", "Todo cannot be empty!", "error");
      return;
    }
    createTodo.mutate({ title: newTodo, completed: false, userId: 1 });
  };

  const handleUpdateTodo = (id: number) => {
    if (!editText.trim()) {
      Swal.fire("Error", "Updated text cannot be empty!", "error");
      return;
    }
    editTodo.mutate({ id, title: editText });
  };

  const handleDrop = (completed: boolean) => {
    if (draggedTodo !== null) {
      toggleTodo.mutate({ id: draggedTodo, completed });
      setDraggedTodo(null);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-4xl font-bold mb-6">Todo List</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          className="px-4 py-2 rounded-lg text-black w-64 border border-gray-300 focus:ring-2 focus:ring-blue-500"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Enter a new todo"
        />
        <button
          onClick={handleAddTodo}
          className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-500"
          disabled={createTodo.isPending}
        >
          {createTodo.isPending ? "Adding..." : "Add Todo"}
        </button>
      </div>

      {isLoading && <p>Loading todos...</p>}
      {error && <p className="text-red-500">Error loading todos</p>}

      <div className="flex gap-6 w-full max-w-2xl">
        <div
          className="w-1/2 bg-gray-800 p-4 rounded-lg border border-gray-700"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(false)}
        >
          <h2 className="text-xl font-semibold mb-3">Not Completed</h2>
          <ul className="space-y-2">
            {todos?.filter((todo) => !todo.completed).map((todo) => (
              <li
                key={todo.id}
                draggable
                onDragStart={() => setDraggedTodo(todo.id)}
                className="flex justify-between items-center p-3 rounded-lg bg-gray-700 cursor-grab hover:bg-gray-600 transition"
              >
                {editingTodo === todo.id ? (
                  <input
                    type="text"
                    className="px-2 py-1 rounded-lg text-black w-full border border-gray-300 focus:ring-2 focus:ring-yellow-500"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateTodo(todo.id);
                    }}
                  />
                ) : (
                  <span>{todo.title}</span>
                )}
                <div className="flex gap-2">
                  {editingTodo === todo.id ? (
                    <>
                      <button
                        onClick={() => handleUpdateTodo(todo.id)}
                        className="bg-green-500 px-2 py-1 rounded-lg text-sm hover:bg-green-700 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingTodo(null)}
                        className="bg-gray-500 px-2 py-1 rounded-lg text-sm hover:bg-gray-700 transition"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingTodo(todo.id);
                          setEditText(todo.title);
                        }}
                        className="bg-yellow-500 px-2 py-1 rounded-lg text-sm hover:bg-yellow-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTodo.mutate(todo.id)}
                        className="bg-red-500 px-2 py-1 rounded-lg text-sm hover:bg-red-700 transition disabled:bg-gray-500"
                        disabled={deleteTodo.isPending}
                      >
                        {deleteTodo.isPending ? "Deleting..." : "Delete"}
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="w-1/2 bg-green-700 p-4 rounded-lg border border-green-600"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(true)}
        >
          <h2 className="text-xl font-semibold mb-3">Completed</h2>
          <ul className="space-y-2">
            {todos?.filter((todo) => todo.completed).map((todo) => (
              <li
                key={todo.id}
                draggable
                onDragStart={() => setDraggedTodo(todo.id)}
                className="flex justify-between items-center p-3 rounded-lg bg-green-600 cursor-grab line-through hover:bg-green-500 transition"
              >
                {todo.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
