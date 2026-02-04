"use client";

import { usePortfolio } from "@/contexts/PortfolioContext";
import Link from "next/link";
import { useState } from "react";

function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="card max-w-md mx-4 animate-fade-in">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button onClick={onConfirm} className="btn-danger">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function PortfoliosPage() {
  const { portfolios, activePortfolio, isLoading, deletePortfolio, setActivePortfolio } = usePortfolio();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteId) {
      await deletePortfolio(deleteId);
      setDeleteId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  if (isLoading) {
    return (
      <div className="container-page">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-6 w-48 mb-2"></div>
              <div className="skeleton h-4 w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-page animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Portfolios</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and view all your portfolios</p>
        </div>
        <Link href="/import" className="btn-primary">
          + Create Portfolio
        </Link>
      </div>

      {portfolios.length === 0 ? (
        <div className="card text-center py-16">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No portfolios yet</h2>
          <p className="text-slate-600 mb-6">Create your first portfolio to get started with analytics.</p>
          <Link href="/import" className="btn-primary">
            Create Your First Portfolio
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {portfolios.map((portfolio) => {
            const isActive = activePortfolio?.id === portfolio.id;
            const totalHoldings = portfolio.holdings.length;
            const totalValue = portfolio.holdings.reduce((sum, h: any) => {
              const price = h.avgCost ?? 0;
              return sum + (h.quantity * price);
            }, 0);

            return (
              <div
                key={portfolio.id}
                className={`card-hover cursor-pointer ${isActive ? "ring-2 ring-brand-accent" : ""}`}
                onClick={() => setActivePortfolio(portfolio)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isActive ? "bg-brand-accent text-white" : "bg-slate-100 text-slate-600"}`}>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{portfolio.name}</h3>
                        {isActive && (
                          <span className="rounded-full bg-brand-accent/10 px-2 py-0.5 text-xs font-medium text-brand-accent">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {totalHoldings} holdings · Created {formatDate(portfolio.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-slate-500">Total value</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/dashboard"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePortfolio(portfolio);
                        }}
                        className="btn-ghost"
                      >
                        View
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(portfolio.id);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Portfolio?"
          message="This action cannot be undone. All holdings and analytics for this portfolio will be permanently deleted."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
