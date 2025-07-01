import React from 'react';
import { Card, CardContent, Typography, Avatar, Box, Tooltip } from '@mui/material';
import { blue, cyan, green, orange, purple, yellow } from '@mui/material/colors';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const roleColors = {
  'CEO': blue[900],
  'CTO': green[500],
  'Founder': cyan[700],
  'Co-Founder': cyan[700],
  'VP': purple[500],
  'Director': purple[400],
  'Head': blue[400],
  'default': yellow[900]
};

const getRoleColor = (role) => {
  const roleKey = Object.keys(roleColors).find(key => 
    role.toLowerCase().includes(key.toLowerCase())
  );
  return roleColors[roleKey] || roleColors.default;
};

const TeamMemberCard = ({ member }) => {
  const initials = member.name.split(' ').map(n => n[0]).join('');
  const roleColor = getRoleColor(member.role);

  const handleClick = () => {
    if (member.linkedin_url) {
      window.open(member.linkedin_url, '_blank', 'noopener,noreferrer');
    } else if (member.employee_url) {
      window.open(member.employee_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Tooltip title={member.linkedin_url ? "View LinkedIn profile" : "No LinkedIn profile"} arrow>
      <Card 
        onClick={handleClick}
        sx={{ 
          width: 160,
          height: 180,
          borderRadius: 2,
          boxShadow: 1,
          transition: 'transform 0.2s, box-shadow 0.2s',
          mx: 1,
          flexShrink: 0,
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 3,
            border: `1px solid ${roleColor}`
          }
        }}
      >
        <CardContent sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          position: 'relative'
        }}>
          {member.linkedin_url && (
            <LinkedInIcon 
              color="primary" 
              sx={{ 
                position: 'absolute',
                top: 8,
                right: 8,
                fontSize: '1.2rem',
                color: '#0077b5'
              }} 
            />
          )}
          <Avatar sx={{ 
            width: 48, 
            height: 48, 
            mb: 1.5,
            bgcolor: roleColor,
            fontSize: '1.25rem'
          }}>
            {initials}
          </Avatar>
          <Typography 
            variant="subtitle1" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              textAlign: 'center',
              lineHeight: 1.2,
              mb: 0.5
            }}
          >
            {member.name}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              backgroundColor: `${roleColor}20`,
              color: roleColor,
              px: 1,
              py: 0.5,
              borderRadius: 2,
              fontWeight: 'medium',
              textAlign: 'center',
              lineHeight: 1.2
            }}
          >
            {member.role}
          </Typography>
        </CardContent>
      </Card>
    </Tooltip>
  );
};

export default TeamMemberCard;