import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { apiService } from '../services/api';

interface Order {
  id: number;
  createdAt: string;
  totalPrice: number;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface OrdersProps {
  open: boolean;
  onClose: () => void;
}

const Orders: React.FC<OrdersProps> = ({ open, onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getOrders();
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchOrders();
    }
  }, [open]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Order History</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : orders.length === 0 ? (
          <Typography variant="body1" align="center">
            No orders found
          </Typography>
        ) : (
          <List>
            {orders.map((order) => (
              <ListItem
                key={order.id}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  borderBottom: '1px solid #eee',
                  py: 2,
                }}
              >
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1">
                    Order #{order.id}
                  </Typography>
                  <Typography variant="subtitle1" color="primary">
                    ${order.totalPrice.toFixed(2)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {formatDate(order.createdAt)}
                </Typography>
                <List sx={{ width: '100%', pl: 2 }}>
                  {order.items.map((item) => (
                    <ListItem key={item.id} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.quantity}x - $${(item.price * item.quantity).toFixed(2)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Orders; 