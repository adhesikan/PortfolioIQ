"use client";

import { useState } from "react";
import Link from "next/link";

export default function DashboardClient() {
  const [count, setCount] = useState(0);

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold mb-4">Dashboard Test</h1>
      <p className="mb-4">If you see this, client components work!</p>
      <p className="mb-4">Count: {count}</p>
      <button 
        onClick={() => setCount(c => c + 1)}
        className="btn-primary"
      >
        Increment
      </button>
      <div className="mt-6">
        <Link href="/" className="text-blue-600 hover:underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
