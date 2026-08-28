import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { type FinancialMovement } from "@/lib/financial-types";
import { computeKPIs, computeMonthlyData } from "@/lib/financial-utils";

const IncomeOutcomeChart = lazy(() =>
  import("@/components/dashboard/income-outcome-chart").then((module) => ({
    default: module.IncomeOutcomeChart,
  })),
);

const ProfitPercentChart = lazy(() =>
  import("@/components/dashboard/profit-percent-chart").then((module) => ({
    default: module.ProfitPercentChart,
  })),
);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function fetchFinancialData(
  signal?: AbortSignal,
): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}

function ChartLoadingFallback() {
  return (
    <div className="rounded-xl border border-border/60 bg-card px-6 py-6 shadow-sm">
      <div className="h-5 w-52 animate-pulse rounded bg-accent" />
      <div className="mt-2 h-3 w-64 animate-pulse rounded bg-accent" />
      <div className="mt-6 h-70 w-full animate-pulse rounded-lg bg-accent" />
    </div>
  );
}

function App() {
  const [movements, setMovements] = useState<FinancialMovement[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const metrics = useMemo(
    () => (movements ? computeKPIs(movements) : null),
    [movements],
  );

  const monthlyData = useMemo(
    () => (movements ? computeMonthlyData(movements) : []),
    [movements],
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchFinancialData(controller.signal)
      .then((movements) => {
        setMovements(movements);
      })
      .catch((requestError: unknown) => {
        if (
          requestError instanceof Error &&
          requestError.name === "AbortError"
        ) {
          return;
        }
        setError(
          "No se pudo cargar la informacion financiera. Revisa la API de backend.",
        );
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <>
      <a href="#dashboard-content" className="skip-link">
        Skip to dashboard content
      </a>
      <main className="dark min-h-screen bg-background text-foreground">
        <div
          id="dashboard-content"
          className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
          tabIndex={-1}
        >
          <div className="flex flex-col gap-8">
            <DashboardHeader />

            {error ? (
              <div
                className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            ) : null}

            <section
              aria-label="Key performance indicators"
              aria-busy={loading}
            >
              <KPIRow metrics={metrics} loading={loading} />
            </section>

            <section
              aria-label="Financial charts"
              aria-busy={loading}
              className="grid grid-cols-1 gap-4 xl:grid-cols-2"
            >
              <Suspense fallback={<ChartLoadingFallback />}>
                <IncomeOutcomeChart data={monthlyData} loading={loading} />
              </Suspense>
              <Suspense fallback={<ChartLoadingFallback />}>
                <ProfitPercentChart data={monthlyData} loading={loading} />
              </Suspense>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
