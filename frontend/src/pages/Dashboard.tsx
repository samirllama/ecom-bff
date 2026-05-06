// frontend/src/pages/Dashboard.tsx
import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useDashboard } from "../hooks/useDashboard";
import { OrderStatus } from "@shared/dashboard";

const StatCard: React.FC<{
  title: string;
  value: string | number;
  loading?: boolean;
}> = ({ title, value, loading }) => (
  <Card>
    <CardContent>
      <Typography color="textSecondary" gutterBottom>
        {title}
      </Typography>
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

const Dashboard: React.FC = () => {
  const { data, loading, error } = useDashboard();

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={data?.totalProducts ?? 0}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={data?.totalOrders ?? 0}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`$${(data?.totalRevenue ?? 0).toLocaleString()}`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={data?.activeUsers ?? 0}
            loading={loading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Trend
              </Typography>
              {loading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data?.revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Products
              </Typography>
              {loading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              {loading ? (
                <Skeleton variant="rectangular" height={200} />
              ) : (
                <Box>
                  {data?.recentOrders.map((order) => (
                    <Box
                      key={order.id}
                      display="flex"
                      justifyContent="space-between"
                      p={2}
                      borderBottom="1px solid #eee"
                    >
                      <Box>
                        <Typography variant="body1">
                          {order.customerName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(order.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body1">
                          ${order.amount.toFixed(2)}
                        </Typography>
                        <Typography
                          variant="body2"
                          style={{
                            color:
                              order.status === OrderStatus.Delivered
                                ? "green"
                                : order.status === OrderStatus.Pending || order.status === OrderStatus.Processing
                                  ? "orange"
                                  : order.status === OrderStatus.Shipped
                                    ? "blue"
                                    : "red",
                          }}
                        >
                          {order.status}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
