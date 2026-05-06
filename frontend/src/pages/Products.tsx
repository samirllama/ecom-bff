import React, { useState } from "react";
import { 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Chip,
  Alert,
  Skeleton
} from "@mui/material";
import { 
  DataGrid, 
  GridColDef, 
  GridValueGetter,
  GridRenderCellParams 
} from "@mui/x-data-grid";
import { Link as RouterLink } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { Product } from "@shared/dashboard";

const Products: React.FC = () => {
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const { products, total, loading, error } = useProducts({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  });

  const columns: GridColDef[] = [
    { 
      field: "name", 
      headerName: "Product Name", 
      flex: 1,
      renderCell: (params: GridRenderCellParams<Product>) => (
        <Button 
          component={RouterLink} 
          to={`/products/${params.row.id}`}
          sx={{ textTransform: 'none', justifyContent: 'flex-start', width: '100%' }}
        >
          {params.value}
        </Button>
      )
    },
    { field: "category", headerName: "Category", width: 150 },
    { 
      field: "price", 
      headerName: "Price", 
      type: "number", 
      width: 120,
      valueGetter: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      field: "stock", 
      headerName: "Stock", 
      type: "number", 
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value} 
          color={params.value > 10 ? "success" : "error"} 
          size="small" 
        />
      )
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Products
        </Typography>
        <Button variant="contained" color="primary">
          Add Product
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        {loading ? (
          <Box sx={{ p: 2 }}>
            <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={400} />
          </Box>
        ) : (
          <DataGrid
            rows={products}
            columns={columns}
            rowCount={total}
            loading={loading}
            pageSizeOptions={[5, 10, 25]}
            paginationModel={paginationModel}
            paginationMode="server"
            onPaginationModelChange={setPaginationModel}
            disableRowSelectionOnClick
          />
        )}
      </Paper>
    </Box>
  );
};

export default Products;
