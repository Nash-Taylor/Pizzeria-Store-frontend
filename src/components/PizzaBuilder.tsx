import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CrustSelection from './CrustSelection';
import SauceSelection from './SauceSelection';
import ToppingsSelection from './ToppingsSelection';
import { Ingredient, PizzaSelection, ValidationResponse } from '../types/types';
import { apiService } from '../services/api';
import InfoIcon from '@mui/icons-material/Info';
import customizePizzaBg from '../assets/customize_pizzabg.png';

const steps = ['Choose Crust', 'Choose Sauce', 'Choose Toppings'];

const PizzaBuilder: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<PizzaSelection>({
    crust: null,
    sauce: [],
    toppings: [],
  });
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getAllIngredients();
        const data = response.data;
        console.log('Received ingredients:', JSON.stringify(data, null, 2));
        // Convert price strings to numbers before setting state
        const processedData = data.map((ingredient: Ingredient) => ({
          ...ingredient,
          price: typeof ingredient.price === 'string' ? parseFloat(ingredient.price) : ingredient.price
        }));
        setIngredients(processedData);
      } catch (error) {
        console.error('Failed to load ingredients:', error);
        setError('Failed to load ingredients. Please make sure the backend server is running at http://localhost:5425');
      } finally {
        setLoading(false);
      }
    };
    loadIngredients();
  }, []);

  const crusts = ingredients.filter((i) => i.id >= 1 && i.id <= 9);
  const sauces = ingredients.filter((i) => i.id >= 10 && i.id <= 23);
  const toppings = ingredients.filter((i) => i.id >= 24);

  const validateSelection = async () => {
    const selectedIngredients = [
      selection.crust,
      ...selection.sauce,
      ...selection.toppings,
    ].filter((i): i is Ingredient => i !== null);

    try {
      const response = await apiService.validateSelection(selectedIngredients.map((i) => i.id));
      const result = response.data;
      setValidation(result);
      return result.isValid;
    } catch (error) {
      console.error('Validation failed:', error);
      return false;
    }
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      const isValid = await validateSelection();
      if (isValid) {
        // Handle order submission
        console.log('Order validated:', selection);
        setOrderSuccess(true);
      }
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return selection.crust !== null;
      case 1:
        return selection.sauce.length > 0;
      case 2:
        return selection.toppings.length >= 2;
      default:
        return false;
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <CrustSelection
            crusts={crusts}
            selectedCrust={selection.crust}
            onSelect={(crust) => setSelection({ ...selection, crust })}
          />
        );
      case 1:
        return (
          <SauceSelection
            sauces={sauces}
            selectedSauces={selection.sauce}
            onSelect={(sauce) => {
              const exists = selection.sauce.find(s => s.id === sauce.id);
              if (exists) {
                // Remove the sauce if it's already selected
                setSelection({
                  ...selection,
                  sauce: selection.sauce.filter(s => s.id !== sauce.id)
                });
              } else {
                // Get the base sauce name (without Regular/Extra)
                const [portion, ...nameParts] = sauce.name.split(' ');
                const baseType = nameParts.join(' ');

                // Remove any existing variant of this sauce
                const newSauces = selection.sauce
                  .filter(s => {
                    const [existingPortion, ...existingNameParts] = s.name.split(' ');
                    return existingNameParts.join(' ') !== baseType;
                  })
                  .concat([sauce]);

                setSelection({
                  ...selection,
                  sauce: newSauces.length <= 2 ? newSauces : selection.sauce
                });
              }
            }}
          />
        );
      case 2:
        return (
          <ToppingsSelection
            toppings={toppings}
            selectedToppings={selection.toppings}
            onSelect={(topping) => {
              // Find if we have any variant of this topping selected
              const baseType = topping.name.split(' ').slice(1).join(' ');
              const hasVariant = selection.toppings.some(t => 
                t.name.split(' ').slice(1).join(' ') === baseType
              );
              
              const exists = selection.toppings.find(t => t.id === topping.id);
              const newToppings = exists
                ? selection.toppings.filter(t => t.id !== topping.id)
                : hasVariant
                  ? selection.toppings.filter(t => 
                      t.name.split(' ').slice(1).join(' ') !== baseType
                    ).concat([topping])
                  : [...selection.toppings, topping];
              
              setSelection({ ...selection, toppings: newToppings });
            }}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#f8f9fa',
      py: 4,
      px: 2,
      overflowY: 'auto',
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${customizePizzaBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <Paper elevation={3} sx={{ 
        p: 4, 
        mx: 'auto',
        maxWidth: 'lg',
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        minHeight: { xs: 'auto', md: '90vh' },
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          borderBottom: '2px solid #1976d2',
          pb: 2
        }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 'bold',
              color: '#1976d2',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            Build Your Perfect Pizza
          </Typography>
          <IconButton
            onClick={() => setShowInfo(prev => !prev)}
            color="primary"
            sx={{ 
              ml: 2,
              bgcolor: 'rgba(25, 118, 210, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.2)'
              }
            }}
          >
            <InfoIcon />
          </IconButton>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : orderSuccess ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            Your order has been successfully placed! Start a new order to build another pizza.
          </Alert>
        ) : (
          <>
            <Dialog
              open={showInfo}
              onClose={() => setShowInfo(false)}
              maxWidth="sm"
              fullWidth
              disablePortal
              keepMounted
              aria-labelledby="pizza-info-dialog-title"
              aria-describedby="pizza-info-dialog-description"
            >
              <DialogTitle id="pizza-info-dialog-title">Pizza Building Guidelines</DialogTitle>
              <DialogContent id="pizza-info-dialog-description">
                <Typography variant="subtitle1" gutterBottom>
                  <ul style={{ marginBottom: 0, paddingLeft: '1.5rem' }}>
                    <li>You can select up to 2 sauces for your pizza</li>
                    <li>A minimum of 2 toppings is required</li>
                  </ul>
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowInfo(false)}>Close</Button>
              </DialogActions>
            </Dialog>

            <Stepper 
              activeStep={activeStep} 
              sx={{ 
                pt: 3, 
                pb: 5,
                '& .MuiStepLabel-root .Mui-completed': {
                  color: 'success.main',
                },
                '& .MuiStepLabel-root .Mui-active': {
                  color: 'primary.main',
                }
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ flexGrow: 1 }}>
              {getStepContent(activeStep)}
            </Box>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mt: 4,
              pt: 4,
              borderTop: '1px solid #eee'
            }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={{ px: 4 }}
              >
                Back
              </Button>
              <Box>
                {validation && validation.totalPrice !== null && (
                  <Typography variant="h5" sx={{ mr: 3, display: 'inline', fontWeight: 'bold' }}>
                    Total: ${Number(validation.totalPrice).toFixed(2)}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  sx={{ px: 4 }}
                >
                  {activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default PizzaBuilder; 