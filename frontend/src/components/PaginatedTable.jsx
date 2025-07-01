import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

const PaginatedTable = ({ data, columns, rowsPerPage = 5, title }) => {
  const [page, setPage] = useState(0);

  const handleNextPage = () => {
    setPage((prevPage) => Math.min(prevPage + 1, Math.ceil(data.length / rowsPerPage) - 1));
  };

  const handlePrevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const currentData = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <Box sx={{ mb: 0 }}>
      <Typography variant="h6" gutterBottom sx={{ 
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        color: 'primary.main'
      }}>
        {title}
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="caption" sx={{ mr: 1 }}>
          {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, data.length)} of {data.length}
        </Typography>
        <IconButton onClick={handlePrevPage} disabled={page === 0}>
          <KeyboardArrowLeft />
        </IconButton>
        <IconButton onClick={handleNextPage} disabled={(page + 1) * rowsPerPage >= data.length}>
          <KeyboardArrowRight />
        </IconButton>
      </Typography>
      
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'action.hover' }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.field} sx={{ fontWeight: 'bold' }}>
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentData.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.field}>
                    {column.renderCell ? column.renderCell(row) : row[column.field]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PaginatedTable;