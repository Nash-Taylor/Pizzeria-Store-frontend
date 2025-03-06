import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import HomePage from './components/HomePage';
import PizzaBuilder from './components/PizzaBuilder';
import CartPage from './components/CartPage';
import OrdersPage from './components/OrdersPage';
import AuthModal from './components/AuthModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider } from './contexts/OrderContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#e65100',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          width: '100%',
          height: '100%',
        },
        body: {
          width: '100%',
          minHeight: '100%',
          margin: 0,
          padding: 0,
          overflowX: 'hidden',
        },
        '#root': {
          width: '100%',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      },
    },
  },
});

const AppContent: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const { showAuthModal } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <>
              <NavigationBar
                onSectionChange={setActiveSection}
                onAuthClick={() => setIsAuthModalOpen(true)}
              />
              <HomePage
                activeSection={activeSection}
              />
            </>
          } 
        />
        <Route 
          path="/builder" 
          element={<PizzaBuilder />} 
        />
        <Route 
          path="/cart" 
          element={<CartPage />} 
        />
        <Route 
          path="/orders" 
          element={<OrdersPage />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AuthModal
        open={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <OrderProvider>
            <AppContent />
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
