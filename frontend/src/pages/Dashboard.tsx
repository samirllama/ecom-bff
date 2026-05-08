// frontend/src/pages/Dashboard.tsx
import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  Alert,
  Tooltip,
} from "@mui/material";
import { WarningAmber } from "@mui/icons-material";
import { TopProduct } from "@shared/dashboard";
import { useDashboard } from "../hooks/useDashboard";

// StatCard now accepts an optional 'warning' prop
const StatCard: React.FC<{
  title: string;
  value: string | number;
  loading?: boolean;
  warning?: boolean;
}> = ({ title, value, loading, warning }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" gap={1}>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        {warning && (
          <Tooltip title="This data might be outdated or unavailable">
            <WarningAmber color="warning" fontSize="small" />
          </Tooltip>
        )}
      </Box>
      {loading ? (
        <Skeleton variant="text" width={100} height={40} />
      ) : (
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const TopProductsList: React.FC<{
  products: TopProduct[];
  loading: boolean;
}> = ({ products, loading }) => (
  <Card>
    <CardContent>
      <Typography variant="h6">Top Products</Typography>
      {loading ? (
        <Skeleton variant="rectangular" height={200} />
      ) : products.length === 0 ? (
        <Typography color="textSecondary">No product data available</Typography>
      ) : (
        products.map((p) => (
          <Box key={p.id} display="flex" justifyContent="space-between" my={1}>
            <Typography>{p.name}</Typography>
            <Typography>{p.sales} sold</Typography>
          </Box>
        ))
      )}
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const { data, loading, globalError, refetch } = useDashboard();

  if (globalError) {
    return (
      <Box p={3}>
        <Alert
          severity="error"
          action={<button onClick={refetch}>Retry</button>}
        >
          {globalError}
        </Alert>
      </Box>
    );
  }

  const sources = data?.sources || {};

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Live Dashboard
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={data?.totalProducts ?? 0}
            loading={loading}
            warning={sources.productCount === "error"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={data?.totalOrders ?? 0}
            loading={loading}
            warning={sources.allOrders === "error"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`$${data?.totalRevenue.toLocaleString() ?? 0}`}
            loading={loading}
            warning={sources.revenueData === "error"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={data?.activeUsers ?? 0}
            loading={loading}
            warning={sources.activeUsers === "error"}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TopProductsList
            products={data?.topProducts ?? []}
            loading={loading}
          />
        </Grid>
        {/* Add recent orders, revenue chart, etc. */}
      </Grid>
    </Box>
  );
};

export default Dashboard;
