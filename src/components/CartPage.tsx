import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Divider,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleQuantityChange = (itemId: number, change: number) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        updateQuantity(itemId, newQuantity);
      }
    }
  };

  const handleCheckout = () => {
    // TODO: Implement checkout logic
    console.log('Proceeding to checkout...');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100vw',
      bgcolor: '#f8f9fa',
      py: 4,
      px: 2,
    }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(!sidebarOpen)} />
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, bgcolor: 'white' }}>
          <Typography variant="h4" gutterBottom>
            Shopping Cart
          </Typography>

          {totalItems === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Your cart is empty
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/builder')}
                sx={{ mt: 2 }}
              >
                Build a Pizza
              </Button>
            </Box>
          ) : (
            <>
              <List>
                {items.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem>
                      <ListItemText
                        primary={item.name}
                        secondary={`$${item.price.toFixed(2)}`}
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.id, -1)}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            <AddIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => removeItem(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">
                    Total Items: {totalItems}
                  </Typography>
                  <Typography variant="h5" color="primary">
                    Total: ${totalPrice.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default CartPage; 