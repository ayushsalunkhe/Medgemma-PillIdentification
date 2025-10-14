import { ref, push, set, get, child, update } from 'firebase/database';
import { auth, database } from './firebaseService';

interface ConsultationRequest {
  userId: string;
  userEmail: string;
  medicineInfo: any;
  medicineImage: string;
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

// Use the database instance from firebaseService

export const createConsultationRequest = async (medicineInfo: any, medicineImage: string, symptoms: string) => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to create a consultation request');
  }

  const consultationsRef = ref(database, 'consultations');
  const newConsultationRef = push(consultationsRef);

  // Clean up medicineInfo by removing undefined values
  const cleanMedicineInfo = (info: any) => {
    if (!info) return null;
    const cleaned: any = {};
    Object.keys(info).forEach(key => {
      const value = info[key];
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          cleaned[key] = cleanMedicineInfo(value);
        } else {
          cleaned[key] = value;
        }
      }
    });
    return cleaned;
  };

  const consultationData: ConsultationRequest = {
    userId: auth.currentUser.uid,
    userEmail: auth.currentUser.email || '',
    medicineInfo: {
      name: medicineInfo.name, // Only send the medicine name
      ...(medicineInfo.activeIngredients ? { activeIngredients: medicineInfo.activeIngredients } : {})
    },
    medicineImage: '',  // We're not using the image anymore
    symptoms,
    status: 'pending',
    createdAt: Date.now()
  };

  await set(newConsultationRef, consultationData);
  return newConsultationRef.key;
};

export const respondToConsultation = async (consultationId: string, response: string) => {
  if (!auth.currentUser) {
    throw new Error('Doctor must be logged in to respond');
  }

  const userType = localStorage.getItem('userType');
  if (userType !== 'doctor') {
    throw new Error('Only doctors can respond to consultations');
  }

  const consultationRef = ref(database, `consultations/${consultationId}`);
  await update(consultationRef, {
    status: 'responded',
    response: {
      doctorId: auth.currentUser.uid,
      doctorEmail: auth.currentUser.email,
      message: response,
      respondedAt: Date.now()
    }
  });
};

export const getUserConsultations = async () => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to view consultations');
  }

  const consultationsRef = ref(database);
  const snapshot = await get(child(consultationsRef, 'consultations'));

  if (!snapshot.exists()) {
    return [];
  }

  const consultations = [];
  snapshot.forEach((childSnapshot) => {
    const consultation = childSnapshot.val();
    if (consultation.userId === auth.currentUser?.uid) {
      consultations.push({
        id: childSnapshot.key,
        ...consultation
      });
    }
  });

  return consultations;
};

export const getDoctorConsultations = async () => {
  if (!auth.currentUser) {
    throw new Error('Doctor must be logged in to view consultations');
  }

  const userType = localStorage.getItem('userType');
  if (userType !== 'doctor') {
    throw new Error('Only doctors can view all consultations');
  }

  const consultationsRef = ref(database);
  const snapshot = await get(child(consultationsRef, 'consultations'));

  if (!snapshot.exists()) {
    return [];
  }

  const consultations = [];
  snapshot.forEach((childSnapshot) => {
    consultations.push({
      id: childSnapshot.key,
      ...childSnapshot.val()
    });
  });

  return consultations.sort((a, b) => b.createdAt - a.createdAt);
};