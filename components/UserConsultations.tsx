import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { getUserConsultations } from '../services/consultationService';

interface Consultation {
  id: string;
  medicineInfo: {
    name: string;
    activeIngredients?: string[] | string;
  };
  symptoms: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: number;
  response?: {
    doctorId: string;
    doctorEmail: string;
    message: string;
    respondedAt: number;
  };
}

const UserConsultations: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConsultations = async () => {
      try {
        const data = await getUserConsultations();
        setConsultations(data.sort((a, b) => b.createdAt - a.createdAt));
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadConsultations();
  }, []);

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Loading your consultations...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text color="red.500">Error: {error}</Text>
      </Container>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'responded':
        return 'green';
      case 'closed':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading size="lg" mb={6}>Your Consultations</Heading>
      
      {consultations.length === 0 ? (
        <Text>You haven't made any consultation requests yet.</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          <Accordion allowMultiple>
            {consultations.map((consultation) => (
              <AccordionItem key={consultation.id}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold">
                      Medicine: {consultation.medicineInfo.name}
                    </Text>
                    <Badge 
                      colorScheme={getStatusColor(consultation.status)}
                      ml={2}
                    >
                      {consultation.status}
                    </Badge>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack align="stretch" spacing={3}>
                    <Box>
                      <Text fontWeight="semibold">Your Symptoms:</Text>
                      <Text>{consultation.symptoms}</Text>
                    </Box>
                    
                    {consultation.medicineInfo.activeIngredients && (
                      <Box>
                        <Text fontWeight="semibold">Active Ingredients:</Text>
                        <Text>
                          {Array.isArray(consultation.medicineInfo.activeIngredients)
                            ? consultation.medicineInfo.activeIngredients.join(', ')
                            : consultation.medicineInfo.activeIngredients}
                        </Text>
                      </Box>
                    )}
                    
                    <Box>
                      <Text fontWeight="semibold">Requested on:</Text>
                      <Text>{formatDate(consultation.createdAt)}</Text>
                    </Box>

                    {consultation.response ? (
                      <Box 
                        bg="green.50" 
                        p={4} 
                        rounded="md" 
                        border="1px" 
                        borderColor="green.200"
                      >
                        <Text fontWeight="semibold" color="green.700">
                          Doctor's Response:
                        </Text>
                        <Text mt={2}>{consultation.response.message}</Text>
                        <Text mt={2} fontSize="sm" color="green.600">
                          Responded by Dr. {consultation.response.doctorEmail} on {formatDate(consultation.response.respondedAt)}
                        </Text>
                      </Box>
                    ) : (
                      <Box p={4} bg="gray.50" rounded="md">
                        <Text color="gray.600">
                          Waiting for doctor's response...
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </VStack>
      )}
    </Container>
  );
};

export default UserConsultations;