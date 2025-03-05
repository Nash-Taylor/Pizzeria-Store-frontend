import React from 'react';
import { Card, CardContent, CardMedia, Typography, Grid, Box } from '@mui/material';
import { Ingredient } from '../types/types';

interface Props {
  crusts: Ingredient[];
  selectedCrust: Ingredient | null;
  onSelect: (crust: Ingredient) => void;
}

const CrustSelection: React.FC<Props> = ({ crusts, selectedCrust, onSelect }) => {
  // Group crusts by type (Thin, Classic, Cheese Burst)
  const groupedCrusts = crusts.reduce((acc, crust) => {
    const type = crust.name.split(' ').slice(1).join(' ');
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(crust);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  // Helper function to get image URL based on crust type
  const getCrustImage = (name: string) => {
    const type = name.toLowerCase();
    if (type.includes('thin')) return '/crusts/thin-crust.jpg';
    if (type.includes('classic')) return '/crusts/classic-crust.jpg';
    if (type.includes('cheese')) return '/crusts/cheese-burst-crust.jpg';
    return '/crusts/default-crust.jpg';
  };

  return (
    <div>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ 
          color: '#1976d2',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
        }}>
          Choose Your Crust
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Select the perfect foundation for your pizza
        </Typography>
      </Box>

      {Object.entries(groupedCrusts).map(([type, crusts]) => (
        <Box key={type} sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{
            color: '#2c3e50',
            fontWeight: 600,
            borderBottom: '2px solid #e0e0e0',
            pb: 1,
            mb: 3
          }}>
            {type}
          </Typography>
          <Grid container spacing={3}>
            {crusts.map((crust) => (
              <Grid item xs={12} sm={6} md={4} key={crust.id}>
                <Card 
                  variant="outlined"
                  sx={{
                    cursor: 'pointer',
                    transform: selectedCrust?.id === crust.id ? 'scale(1.02)' : 'scale(1)',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                    },
                    bgcolor: selectedCrust?.id === crust.id ? '#e3f2fd' : 'white',
                    border: selectedCrust?.id === crust.id ? '2px solid #1976d2' : '1px solid #e0e0e0'
                  }}
                  onClick={() => onSelect(crust)}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={getCrustImage(crust.name)}
                    alt={crust.name}
                    sx={{
                      objectFit: 'cover',
                      borderBottom: '1px solid #e0e0e0'
                    }}
                  />
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 1
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {crust.name.split(' ')[0]}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        color="primary"
                        sx={{ fontWeight: 600 }}
                      >
                        ${Number(crust.price).toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Perfect for {type.toLowerCase()} includes {type === 'Cheese Burst' ? 'extra cheese in the crust' : 'our signature dough'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </div>
  );
};

export default CrustSelection; 