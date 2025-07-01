import React from 'react';
import { Box, Typography, Chip, Stack, Divider } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import LanguageIcon from '@mui/icons-material/Language';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const CompanyHeader = ({ startupData }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ 
        fontWeight: 'bold',
        background: 'linear-gradient(45deg, #1976d2 30%, #2196F3 90%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block'
      }}>
        {startupData.name}
      </Typography>
      
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Chip 
          icon={<BusinessIcon />} 
          label={startupData.industry} 
          variant="outlined" 
          sx={{ 
            borderColor: '#4CAF50',
            color: '#4CAF50'
          }} 
        />
        <Chip 
          icon={<LocationOnIcon />} 
          label={startupData.location} 
          variant="outlined" 
          sx={{ 
            borderColor: '#FF9800',
            color: '#FF9800'
          }} 
        />
        <Chip 
          icon={<LanguageIcon />} 
          label="Website" 
          variant="outlined" 
          onClick={() => window.open(startupData.website, '_blank')}
          sx={{ 
            borderColor: '#9C27B0',
            color: '#9C27B0',
            cursor: 'pointer'
          }} 
        />
      </Stack>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2,
        mb: 3
      }}>
        <MetricCard 
          icon={<PeopleIcon color="primary" />}
          title="Employees"
          value={startupData.employees}
        />
        <MetricCard 
          icon={<AttachMoneyIcon color="success" />}
          title="Revenue"
          value={startupData.revenue}
        />
        <MetricCard 
          icon={<TrendingUpIcon color="info" />}
          title="Growth"
          value={`${startupData.employee_growth}%`}
        />
        <MetricCard 
          icon={<AttachMoneyIcon color="warning" />}
          title="Valuation"
          value={startupData.valuation}
        />
        <MetricCard 
          icon={<AttachMoneyIcon color="secondary" />}
          title="Total Funding"
          value={startupData.funding}
        />
      </Box>
    </Box>
  );
};

const MetricCard = ({ icon, title, value }) => (
  <Box sx={{
    minWidth: 120,
    p: 2,
    borderRadius: 2,
    boxShadow: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'background.paper'
  }}>
    <Box sx={{ mb: 1 }}>{icon}</Box>
    <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
    <Typography variant="h6" fontWeight="bold">{value}</Typography>
  </Box>
);

export default CompanyHeader;