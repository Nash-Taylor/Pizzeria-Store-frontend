import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
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
import CloseIcon from '@mui/icons-material/Close';
import Sidebar from './Sidebar';

const steps = ['Choose Crust', 'Choose Sauce', 'Choose Toppings'];

const PizzaBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addPizza, showLoginPrompt, setShowLoginPrompt } = useCart();
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      if (isValid && selection.crust) {
        // Add complete pizza to cart
        await addPizza(
          selection.crust,
          selection.sauce,
          selection.toppings
        );
        
        // Only show success message and redirect if user is authenticated
        if (isAuthenticated) {
          setOrderSuccess(true);
          setTimeout(() => {
            navigate('/cart');
          }, 2000);
        }
      }
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate('/');
    } else {
      setActiveStep((prev) => prev - 1);
    }
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
      width: '100vw',
      bgcolor: '#f8f9fa',
      py: 4,
      px: 2,
      overflowY: 'auto',
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${customizePizzaBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(!sidebarOpen)} />
      
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
            onClick={() => navigate('/')}
            color="primary"
            sx={{ 
              ml: 2,
              bgcolor: 'rgba(25, 118, 210, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.2)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {getStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                {activeStep === steps.length - 1 ? 'Add to Cart' : 'Next'}
              </Button>
            </Box>
          </>
        )}

        {/* Rules Dialog */}
        <Dialog
          open={showInfo}
          onClose={() => setShowInfo(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Pizza Building Rules</DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph>
              Follow these rules to create your perfect pizza:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body1" paragraph>
                <strong>Crust:</strong> Select one crust type for your pizza base.
              </Typography>
              <Typography component="li" variant="body1" paragraph>
                <strong>Sauce:</strong> Choose up to 2 different sauces. You can select Regular or Extra portions for each sauce type.
              </Typography>
              <Typography component="li" variant="body1" paragraph>
                <strong>Toppings:</strong> Select at least 2 toppings. You can choose Regular or Extra portions for each topping type.
              </Typography>
              <Typography component="li" variant="body1" paragraph>
                <strong>Portions:</strong> Regular portions are standard servings, while Extra portions provide more generous amounts.
              </Typography>
              <Typography component="li" variant="body1" paragraph>
                <strong>Validation:</strong> Your pizza will be validated before order placement to ensure it meets all requirements.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowInfo(false)} color="primary">
              Got it!
            </Button>
          </DialogActions>
        </Dialog>

        {/* Login Required Dialog */}
        <Dialog
          open={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Login Required</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Please log in or create an account to add items to your cart.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowLoginPrompt(false)} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setShowLoginPrompt(false);
                navigate('/');
              }} 
              variant="contained" 
              color="primary"
            >
              Go to Login
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Dialog */}
        <Dialog
          open={orderSuccess}
          onClose={() => setOrderSuccess(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Added to Cart!</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Your pizza has been added to your cart. Redirecting to cart...
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOrderSuccess(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default PizzaBuilder; 