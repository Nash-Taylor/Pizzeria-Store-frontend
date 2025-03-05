import React from 'react';
import { Card, CardContent, Typography, Grid, Chip } from '@mui/material';
import { Ingredient } from '../types/types';

interface Props {
  toppings: Ingredient[];
  selectedToppings: Ingredient[];
  onSelect: (topping: Ingredient) => void;
}

const ToppingsSelection: React.FC<Props> = ({ toppings, selectedToppings, onSelect }) => {
  // Group toppings by category (Veggies, Meats, Cheese)
  const groupedToppings = toppings.reduce((acc, topping) => {
    const [portion, ...nameParts] = topping.name.split(' ');
    const name = nameParts.join(' ');
    
    let category = 'Veggies';
    if (topping.id >= 42 && topping.id <= 55) category = 'Meats';
    if (topping.id >= 56 && topping.id <= 65) category = 'Cheese';

    if (!acc[category]) {
      acc[category] = {};
    }
    if (!acc[category][name]) {
      acc[category][name] = [];
    }
    acc[category][name].push(topping);
    return acc;
  }, {} as Record<string, Record<string, Ingredient[]>>);

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Choose Your Toppings
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Select at least 2 toppings
      </Typography>
      
      {Object.entries(groupedToppings).map(([category, toppings]) => (
        <div key={category} style={{ marginBottom: '30px' }}>
          <Typography variant="h6" gutterBottom>
            {category}
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(toppings).map(([name, variants]) => (
              <Grid item xs={12} sm={6} md={4} key={name}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {name}
                    </Typography>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {variants.map((variant) => (
                        <Chip
                          key={variant.id}
                          label={`${variant.name.split(' ')[0]} ($${variant.price.toFixed(2)})`}
                          onClick={() => onSelect(variant)}
                          color={selectedToppings.some(t => t.id === variant.id) ? "primary" : "default"}
                          variant={selectedToppings.some(t => t.id === variant.id) ? "filled" : "outlined"}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </div>
      ))}
    </div>
  );
};

export default ToppingsSelection; 