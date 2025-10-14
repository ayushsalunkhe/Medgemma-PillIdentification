import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Text,
  VStack,
  useToast,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { loginUser } from '../services/firebaseService';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await loginUser(email, password);
      
      // Store user type in localStorage and trigger storage event
      console.log('Setting userType:', userType); // Debug log
      localStorage.clear(); // Clear any existing data
      localStorage.setItem('userType', userType);
      
      // Force a page reload to ensure all components pick up the new userType
      window.location.href = '/';
      
      toast({
        title: 'Login successful',
        description: `Welcome back! You are logged in as a ${userType}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      navigate('/'); // Redirect to home page
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'An error occurred during login',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <Box p={8} borderWidth={1} borderRadius={8} boxShadow="lg">
        <VStack spacing={4} align="flex-start" w="full">
          <Heading>Login</Heading>
          <Text>Please sign in to continue</Text>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4} w="full">
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>User Type</FormLabel>
                <Select value={userType} onChange={(e) => setUserType(e.target.value)}>
                  <option value="user">Normal User</option>
                  <option value="doctor">Doctor</option>
                </Select>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                width="full"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </VStack>
          </form>

          <Text pt={4}>
            Don't have an account?{' '}
            <ChakraLink as={Link} to="/signup" color="blue.500">
              Sign up here
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default LoginPage;