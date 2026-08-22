"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { useAuth } from "@/components/auth/AuthProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || user?.role !== "admin") return;
    fetch(`${API_URL}/api/auth/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load users"))))
      .then(setUsers)
      .catch((err) => setError(err.message));
  }, [token, user]);

  if (authLoading) {
    return <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center text-zinc-500">Loading...</div>;
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-2xl font-bold text-zinc-900 mb-2">Admin Access Required</h1>
        <p className="text-zinc-500 mb-6">Please log in with an admin account to view this page.</p>
        <Link href="/login" className="rounded-full bg-[#c5a880] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#b0936b]">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <PageHeader eyebrow="Admin Dashboard" title="System" accent="Overview" />
      <div className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-zinc-900 mb-4">Registered Users</h2>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
          )}

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100">
                <th className="py-2 pr-4">Email</th>
                <th className="py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-zinc-50">
                  <td className="py-2 pr-4 text-zinc-700">{u.email}</td>
                  <td className="py-2">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.role === "admin" ? "bg-[#f5f2eb] text-[#8a6d3b]" : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
