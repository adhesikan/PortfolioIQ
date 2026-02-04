"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Holding } from "@/lib/types";

type Portfolio = {
  id: string;
  name: string;
  createdAt: string;
  holdings: Holding[];
};

type PortfolioContextType = {
  portfolios: Portfolio[];
  activePortfolio: Portfolio | null;
  isLoading: boolean;
  error: string | null;
  fetchPortfolios: () => Promise<void>;
  createPortfolio: (name: string, holdings: Holding[]) => Promise<Portfolio | null>;
  updatePortfolio: (id: string, name: string, holdings: Holding[]) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
  setActivePortfolio: (portfolio: Portfolio | null) => void;
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolio, setActivePortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolios = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/portfolios");
      if (!response.ok) throw new Error("Failed to fetch portfolios");
      const data = await response.json();
      setPortfolios(data);
      if (data.length > 0 && !activePortfolio) {
        setActivePortfolio(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const createPortfolio = async (name: string, holdings: Holding[]): Promise<Portfolio | null> => {
    try {
      setError(null);
      const response = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, holdings })
      });
      if (!response.ok) throw new Error("Failed to create portfolio");
      const newPortfolio = await response.json();
      setPortfolios((prev) => [newPortfolio, ...prev]);
      setActivePortfolio(newPortfolio);
      return newPortfolio;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    }
  };

  const updatePortfolio = async (id: string, name: string, holdings: Holding[]) => {
    try {
      setError(null);
      const response = await fetch(`/api/portfolios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, holdings })
      });
      if (!response.ok) throw new Error("Failed to update portfolio");
      const updated = await response.json();
      setPortfolios((prev) => prev.map((p) => (p.id === id ? updated : p)));
      if (activePortfolio?.id === id) {
        setActivePortfolio(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const deletePortfolio = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/portfolios/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete portfolio");
      
      setPortfolios((prev) => {
        const filtered = prev.filter((p) => p.id !== id);
        if (activePortfolio?.id === id) {
          setActivePortfolio(filtered[0] || null);
        }
        return filtered;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  return (
    <PortfolioContext.Provider
      value={{
        portfolios,
        activePortfolio,
        isLoading,
        error,
        fetchPortfolios,
        createPortfolio,
        updatePortfolio,
        deletePortfolio,
        setActivePortfolio
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}
