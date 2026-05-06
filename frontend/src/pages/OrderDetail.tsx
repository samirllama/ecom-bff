import React from "react";
import { useParams } from "react-router-dom";
import { Typography, Box } from "@mui/material";

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <Box>
      <Typography variant="h4">Order Detail: {id}</Typography>
    </Box>
  );
};

export default OrderDetail;
