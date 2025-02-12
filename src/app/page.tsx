"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const createUser = api.user.create.useMutation({
    onSuccess: () => {
      Swal.fire("Success", "User registered successfully!", "success");
      setIsRegister(false);
      setLoading(false);
    },
    onError: (error) => {
      Swal.fire("Error", error.message, "error");
      setLoading(false);
    },
  });

  const loginUser = api.user.getById.useQuery({ id: 1 }, { enabled: false });

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setLoading(true);

    if (!form.email || !form.password || (isRegister && !form.name)) {
      Swal.fire("Error", "All fields are required!", "error");
      setLoading(false);
      return;
    }

    if (isRegister) {
      createUser.mutate({ name: form.name, email: form.email, password: form.password });
    } else {
      const user = await loginUser.refetch();
      if (user.data?.email === form.email) {
        Swal.fire("Success", "Login successful!", "success");
        router.push("/todo");
      } else {
        Swal.fire("Error", "Invalid credentials", "error");
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white py-6 px-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {isRegister ? "Create an Account" : "Sign In"}
        </h1>
        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="Full Name"
              className="border p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="border p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Processing..." : isRegister ? "Register" : "Login"}
          </button>
        </form>
        <button
          className="mt-4 text-blue-400 hover:underline w-full text-center"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
}
