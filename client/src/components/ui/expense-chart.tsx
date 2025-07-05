import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { useTheme } from "./theme-provider";
import type { Expense } from "@shared/schema";

Chart.register(...registerables);

interface ExpenseChartProps {
  expenses: Expense[];
  className?: string;
}

export function ExpenseChart({ expenses, className }: ExpenseChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!canvasRef.current || !expenses.length) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Clean up previous chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Group expenses by category
    const categoryTotals = expenses.reduce((acc, expense) => {
      const category = expense.category;
      acc[category] = (acc[category] || 0) + parseFloat(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    const colors = [
      "hsl(262, 42%, 51%)",
      "hsl(320, 22%, 41%)",
      "hsl(247, 17%, 45%)",
      "hsl(122, 39%, 49%)",
      "hsl(36, 100%, 50%)",
      "hsl(0, 84%, 60%)",
    ];

    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 20,
              color: theme === "dark" ? "#E6E0E9" : "#1D1B20",
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [expenses, theme]);

  if (!expenses.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <p>No expense data available</p>
      </div>
    );
  }

  return (
    <div className={`relative h-[300px] w-full ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
}
