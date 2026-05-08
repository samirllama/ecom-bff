import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Dashboard from "./Dashboard";
import { server } from "../test/setup";
import { rest } from "msw";
import { mockDashboardSummary } from "../test/mocks";
import { describe, it, expect, vi } from "vitest";
import * as useDashboardModule from "../hooks/useDashboard";

// Mock Recharts as it doesn't play well with JSDOM
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  LineChart: () => <div data-testid="line-chart" />,
  BarChart: () => <div data-testid="bar-chart" />,
  Line: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

// Mock the hook
const mockUseDashboard = vi.spyOn(useDashboardModule, "useDashboard");

describe("Dashboard", () => {
  it("shows global error banner when globalError is set", () => {
    mockUseDashboard.mockReturnValue({
      data: null,
      loading: false,
      globalError: "Failed to fetch dashboard data",
      refetch: vi.fn(),
    });

    render(<Dashboard />);
    expect(
      screen.getByText(/failed to fetch dashboard data/i),
    ).toBeInTheDocument();
  });

  it.skip("shows warning badge next to Total Products when productCount source is error", () => {
    mockUseDashboard.mockReturnValue({
      data: {
        totalProducts: 0,
        totalOrders: 10,
        totalRevenue: 1000,
        activeUsers: 50,
        recentOrders: [],
        topProducts: [],
        revenueChart: [],
        sources: {
          productCount: "error",
          allOrders: "ok",
          activeUsers: "ok",
          recentOrders: "ok",
          revenueData: "ok",
          topProducts: "ok",
        },
      },
      loading: false,
      globalError: null,
      refetch: vi.fn(),
    });

    render(<Dashboard />);
    // The warning icon (WarningAmberIcon) will have a tooltip; check for tooltip text
    // or use a test-id on the icon. For brevity, we can just verify the warning text is present.
    expect(screen.getByText(/total products/i).closest("div")).toContainElement(
      screen.getByRole("button", { name: /warn/i }), // depends on icon aria-label
    );
  });

  it("calls refetch when Retry button is clicked", async () => {
    const refetch = vi.fn();
    mockUseDashboard.mockReturnValue({
      data: null,
      loading: false,
      globalError: "Error",
      refetch,
    });

    render(<Dashboard />);
    await userEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(refetch).toHaveBeenCalled();
  });
});
