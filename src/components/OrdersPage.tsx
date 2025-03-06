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
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import Sidebar from './Sidebar';

interface Order {
  orderId: string;
  orderDate: string;
  pizzas: Array<{
    cartItemId: number;
    crust: {
      id: number;
      name: string;
      price: string;
    } | null;
    sauces: Array<{
      id: number;
      name: string;
      price: string;
    }>;
    toppings: Array<{
      id: number;
      name: string;
      price: string;
    }>;
  }>;
}

const OrdersPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiService.getOrders();
        console.log('Raw orders data:', JSON.stringify(response, null, 2)); // More detailed logging
        setOrders(response);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
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
            <Typography variant="body1" color="text.secondary">
              Please log in to view your order history.
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        width: '100vw',
        bgcolor: '#f8f9fa',
        py: 4,
        px: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
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
            <Typography color="error">
              {error}
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

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

          {orders.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              You haven't placed any orders yet.
            </Typography>
          ) : (
            <List>
              {orders.map((order) => (
                <React.Fragment key={order.orderId}>
                  <ListItem>
                    <Card sx={{ width: '100%' }}>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                              Order #{order.orderId}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Placed on: {(() => {
                                console.log('Full order object:', JSON.stringify(order, null, 2));
                                console.log('Order date:', order.orderDate);
                                console.log('Order date type:', typeof order.orderDate);
                                
                                if (!order.orderDate) {
                                  console.log('No order date available');
                                  return 'Date unavailable';
                                }
                                
                                // First try to parse as ISO string
                                let date = new Date(order.orderDate);
                                console.log('First parse attempt:', date);
                                
                                if (isNaN(date.getTime())) {
                                  console.log('First parse failed, trying timestamp');
                                  const timestamp = parseInt(order.orderDate);
                                  if (!isNaN(timestamp)) {
                                    date = new Date(timestamp);
                                    console.log('Timestamp parse result:', date);
                                  }
                                }
                                
                                if (isNaN(date.getTime())) {
                                  console.log('All parsing attempts failed');
                                  return 'Date unavailable';
                                }
                                
                                return date.toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                });
                              })()}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            {order.pizzas.map((pizza, index) => (
                              <Box key={pizza.cartItemId} sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                  Pizza {index + 1}
                                </Typography>
                                {pizza.crust && (
                                  <Box sx={{ mb: 1 }}>
                                    <Typography variant="body2">
                                      Crust: {pizza.crust.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Price: ${Number(pizza.crust.price).toFixed(2)}
                                    </Typography>
                                  </Box>
                                )}
                                {pizza.sauces.length > 0 && (
                                  <Box sx={{ mb: 1 }}>
                                    <Typography variant="body2">
                                      Sauces:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                      {pizza.sauces.map((sauce) => (
                                        <Chip
                                          key={sauce.id}
                                          label={`${sauce.name} ($${Number(sauce.price).toFixed(2)})`}
                                          size="small"
                                        />
                                      ))}
                                    </Box>
                                  </Box>
                                )}
                                {pizza.toppings.length > 0 && (
                                  <Box>
                                    <Typography variant="body2">
                                      Toppings:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                      {pizza.toppings.map((topping) => (
                                        <Chip
                                          key={topping.id}
                                          label={`${topping.name} ($${Number(topping.price).toFixed(2)})`}
                                          size="small"
                                        />
                                      ))}
                                    </Box>
                                  </Box>
                                )}
                              </Box>
                            ))}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </ListItem>
                  <Divider />
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