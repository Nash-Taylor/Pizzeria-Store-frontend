import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCart } from '../contexts/CartContext';

interface CartProps {
  open: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ open, onClose }) => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  const handleQuantityChange = (itemId: number, currentQuantity: number, change: number) => {
    updateQuantity(itemId, currentQuantity + change);
  };

  const handleCheckout = () => {
    // TODO: Implement checkout logic
    clearCart();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Shopping Cart</DialogTitle>
      <DialogContent>
        {items.length === 0 ? (
          <Typography variant="body1" align="center">
            Your cart is empty
          </Typography>
        ) : (
          <List>
            {items.map((item) => (
              <ListItem key={item.id}>
                <ListItemText
                  primary={item.name}
                  secondary={`$${item.price.toFixed(2)}`}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <TextField
                    value={item.quantity}
                    size="small"
                    sx={{ width: '60px', mx: 1 }}
                    inputProps={{ min: 1, style: { textAlign: 'center' } }}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) {
                        updateQuantity(item.id, value);
                      }
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => removeItem(item.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Box sx={{ width: '100%', px: 2, pb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Total: ${totalPrice.toFixed(2)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              fullWidth
            >
              Continue Shopping
            </Button>
            <Button
              variant="contained"
              onClick={handleCheckout}
              fullWidth
              disabled={items.length === 0}
            >
              Checkout
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default Cart; 