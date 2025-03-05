import React from 'react';
import { Card, CardContent, CardMedia, Typography, Grid, Box, Chip, ButtonGroup, Button } from '@mui/material';
import { Ingredient } from '../types/types';

interface Props {
  sauces: Ingredient[];
  selectedSauces: Ingredient[];
  onSelect: (sauce: Ingredient) => void;
}

const SauceSelection: React.FC<Props> = ({ sauces, selectedSauces, onSelect }) => {
  // Helper function to get sauce image URL
  const getSauceImage = (name: string) => {
    const type = name.toLowerCase();
    if (type.includes('marinara')) return '/sauces/marinara.jpg';
    if (type.includes('bbq')) return '/sauces/bbq.jpg';
    if (type.includes('alfredo')) return '/sauces/alfredo.jpg';
    if (type.includes('pesto')) return '/sauces/pesto.jpg';
    return '/sauces/default-sauce.jpg';
  };

  // Group sauces by base type (without portion)
  const groupedSauces = sauces.reduce((acc, sauce) => {
    const [portion, ...nameParts] = sauce.name.split(' ');
    const type = nameParts.join(' ');
    if (!acc[type]) {
      acc[type] = {
        portions: [],
        image: getSauceImage(type)
      };
    }
    acc[type].portions.push(sauce);
    return acc;
  }, {} as Record<string, { portions: Ingredient[], image: string }>);

  const isSelected = (sauce: Ingredient) => selectedSauces.some(s => s.id === sauce.id);
  const canSelectMore = selectedSauces.length < 2;

  const handleSauceSelect = (sauce: Ingredient) => {
    if (!isSelected(sauce) && !canSelectMore) return;

    // Get the base sauce name (without Regular/Extra)
    const [portion, ...nameParts] = sauce.name.split(' ');
    const baseType = nameParts.join(' ');

    // Check if we already have a variant of this sauce
    const hasVariant = selectedSauces.some(s => {
      const [existingPortion, ...existingNameParts] = s.name.split(' ');
      return existingNameParts.join(' ') === baseType;
    });

    if (isSelected(sauce)) {
      // Remove the sauce if it's already selected
      onSelect(sauce);
    } else if (hasVariant) {
      // Replace the existing variant with the new one
      onSelect(sauce);
    } else if (canSelectMore) {
      // Add the new sauce
      onSelect(sauce);
    }
  };

  return (
    <div>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ 
          color: '#1976d2',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
        }}>
          Choose Your Sauce(s)
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Select up to 2 sauces for your pizza
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Selected: {selectedSauces.length === 0 ? 'None' : selectedSauces.map(s => s.name).join(', ')}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {Object.entries(groupedSauces).map(([type, { portions, image }]) => {
          const selectedPortion = portions.find(p => isSelected(p));
          const disabled = !canSelectMore && !selectedPortion;

          return (
            <Grid item xs={12} sm={6} md={4} key={type}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: disabled ? 0.7 : 1,
                  border: selectedPortion ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  bgcolor: selectedPortion ? '#e3f2fd' : 'white',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: disabled ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={image}
                    alt={type}
                    sx={{
                      objectFit: 'cover',
                      borderBottom: '1px solid #e0e0e0'
                    }}
                  />
                  {selectedPortion && (
                    <Box sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                    }}>
                      <Chip 
                        label="Selected"
                        color="primary"
                        size="small"
                        sx={{ 
                          bgcolor: 'primary.main',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      />
                    </Box>
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Choose your preferred portion
                  </Typography>
                  <Box sx={{ mt: 'auto' }}>
                    <ButtonGroup 
                      variant="outlined" 
                      fullWidth 
                      size="large"
                      sx={{ mt: 1 }}
                    >
                      {portions.map((portion) => {
                        const isPortionSelected = isSelected(portion);
                        const [portionSize] = portion.name.split(' ');
                        
                        return (
                          <Button
                            key={portion.id}
                            onClick={() => handleSauceSelect(portion)}
                            variant={isPortionSelected ? "contained" : "outlined"}
                            disabled={!isPortionSelected && disabled}
                            sx={{
                              borderColor: isPortionSelected ? 'primary.main' : 'divider',
                              '&:hover': {
                                borderColor: isPortionSelected ? 'primary.main' : 'divider',
                              }
                            }}
                          >
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {portionSize}
                              </Typography>
                              <Typography variant="caption" display="block">
                                ${Number(portion.price).toFixed(2)}
                              </Typography>
                            </Box>
                          </Button>
                        );
                      })}
                    </ButtonGroup>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};

export default SauceSelection; 