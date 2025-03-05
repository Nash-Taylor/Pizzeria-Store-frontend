import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { apiService } from '../services/api';
import Sidebar from './Sidebar';

interface Order {
  id: number;
  createdAt: string;
  total: number;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  status: string;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await apiService.getOrders();
        setOrders(response.data);
      } catch (err) {
        setError('Failed to load orders. Please try again later.');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
            Order History
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : orders.length === 0 ? (
            <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No orders found
            </Typography>
          ) : (
            <List>
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <ListItem>
                    <ListItemText
                      primary={`Order #${order.id}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            {formatDate(order.createdAt)}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.secondary">
                            Status: {order.status}
                          </Typography>
                        </>
                      }
                    />
                    <Typography variant="h6" color="primary">
                      ${order.total.toFixed(2)}
                    </Typography>
                  </ListItem>
                  <List component="div" disablePadding>
                    {order.items.map((item, index) => (
                      <ListItem key={index} sx={{ pl: 4 }}>
                        <ListItemText
                          primary={item.name}
                          secondary={`Quantity: ${item.quantity}`}
                        />
                        <Typography variant="body2" color="text.secondary">
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 2 }} />
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default OrdersPage; 