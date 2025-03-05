import { Box, Container, Typography, Button, Grid, Paper, useTheme, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import NavigationBar from './NavigationBar';
import AuthModal from './AuthModal';
import pizzaHero from '../assets/pizza-hero.jpg';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import { useAuth } from '../contexts/AuthContext';

const Section = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(8, 0),
}));

const HeroSection = styled(Section)(({ theme }) => ({
  background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${pizzaHero})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: 'white',
  textAlign: 'center',
  position: 'relative',
  margin: 0,
  padding: 0,
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  height: '100%',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
  },
}));

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleBuildPizza = () => {
    navigate('/builder');
  };

  const handleSectionChange = (section: string) => {
    console.log('Current section:', section);
  };

  const handleAuthClick = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    }
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <NavigationBar onSectionChange={handleSectionChange} onAuthClick={handleAuthClick} />
      
      {/* Home Section */}
      <HeroSection id="home">
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h1" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
              fontWeight: 700,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            La Pizzeria Club
          </Typography>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              mb: 4,
              fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' },
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            Where Your Pizza Dreams Come True
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleBuildPizza}
            sx={{ 
              backgroundColor: '#e65100',
              '&:hover': { backgroundColor: '#f57c00' },
              padding: { xs: '8px 24px', sm: '12px 32px' },
              fontSize: { xs: '1rem', sm: '1.1rem' },
            }}
          >
            Build Your Pizza
          </Button>
        </Container>
      </HeroSection>

      {/* About Section */}
      <Section id="about" sx={{ backgroundColor: '#f5f5f5' }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom 
            textAlign="center" 
            sx={{ 
              mb: 6,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            }}
          >
            Our Story
          </Typography>
          <Typography 
            variant="body1" 
            paragraph 
            textAlign="center" 
            sx={{ 
              maxWidth: '800px', 
              mx: 'auto', 
              mb: 6,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              lineHeight: 1.8,
            }}
          >
            Welcome to La Pizzeria Club, where we bring the authentic taste of Italy to your table. 
            Our passion for pizza-making spans generations, and we're excited to share our expertise with you. 
            We believe that every pizza should be as unique as the person ordering it, which is why we've created 
            a custom pizza builder that lets you create your perfect pie.
          </Typography>

          <Grid container spacing={{ xs: 3, sm: 4 }} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <FeatureCard elevation={3}>
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1.3rem', sm: '1.5rem' },
                    fontWeight: 600,
                  }}
                >
                  Fresh Ingredients
                </Typography>
                <Typography sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                  We use only the finest, freshest ingredients sourced from local suppliers and Italian markets.
                </Typography>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard elevation={3}>
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1.3rem', sm: '1.5rem' },
                    fontWeight: 600,
                  }}
                >
                  Custom Creations
                </Typography>
                <Typography sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                  Build your perfect pizza with our interactive pizza builder. Choose from a variety of toppings, 
                  crusts, and sauces to create your dream pizza.
                </Typography>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard elevation={3}>
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1.3rem', sm: '1.5rem' },
                    fontWeight: 600,
                  }}
                >
                  Authentic Taste
                </Typography>
                <Typography sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                  Our traditional recipes and cooking methods ensure that every pizza tastes like it was made in Naples.
                </Typography>
              </FeatureCard>
            </Grid>
          </Grid>
        </Container>
      </Section>

      {/* Contact Section */}
      <Section id="contact">
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom 
            textAlign="center" 
            sx={{ 
              mb: 6,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            }}
          >
            Contact Us
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                  Get in Touch
                </Typography>
                <Typography paragraph>
                  Have questions or want to place a custom order? We'd love to hear from you!
                </Typography>
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Follow Us
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <IconButton color="primary" size="large">
                      <FacebookIcon />
                    </IconButton>
                    <IconButton color="primary" size="large">
                      <InstagramIcon />
                    </IconButton>
                    <IconButton color="primary" size="large">
                      <TwitterIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Section>

      {!isAuthenticated && <AuthModal open={isAuthModalOpen} onClose={handleCloseAuthModal} />}
    </Box>
  );
};

export default HomePage; 