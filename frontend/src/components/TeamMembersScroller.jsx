import React from 'react';
import { Box, Typography } from '@mui/material';
import TeamMemberCard from './TeamMemberCard';

const TeamMembersScroller = ({ members }) => {
  if (!members || members.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No team members data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%',
      overflowX: 'auto',
      py: 1,
      px: 1,
      '&::-webkit-scrollbar': {
        height: '6px'
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent'
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: '3px'
      }
    }}>
      <Box sx={{
        display: 'flex',
        gap: 1,
        width: 'max-content',
        minWidth: '100%'
      }}>
        {members.map((member, index) => (
          <TeamMemberCard key={index} member={member} />
        ))}
      </Box>
    </Box>
  );
};

export default TeamMembersScroller;