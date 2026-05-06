import React from "react";
import { useParams } from "react-router-dom";
import { Typography, Box } from "@mui/material";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <Box>
      <Typography variant="h4">Product Detail: {id}</Typography>
    </Box>
  );
};

export default ProductDetail;
