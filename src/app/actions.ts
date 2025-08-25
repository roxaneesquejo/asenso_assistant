
'use server';

import { evaluateLoanApplication } from '@/ai/flows/evaluate-loan-application';
import { z } from 'zod';
import { type EvaluateLoanApplicationOutput } from '@/ai/schemas';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import { generateCreditAdvice } from '@/ai/flows/generate-credit-advice';
import { redirect } from 'next/navigation';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_DOC_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ...ACCEPTED_IMAGE_TYPES];


const fileSchema = z
  .any()
  .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
  .refine(
    (file) => ACCEPTED_DOC_TYPES.includes(file.type),
    "Only .jpg, .jpeg, .png, .webp, .pdf, .doc, and .docx formats are supported."
  );

const imageFileSchema = z
  .any()
  .refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Only .jpg, .jpeg, .png and .webp formats are supported."
  );

const formSchema = z.object({
  loanType: z.enum(['new', 'existing']),
  referenceNumber: z.string().optional(),
  idPhotos: z.array(imageFileSchema).optional(),
  documents: z.array(fileSchema).optional(),
  typedText: z.string().nullish().default(''),
}).superRefine((data, ctx) => {
    if (data.loanType === 'existing' && !data.referenceNumber) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Reference Number is required for existing applications.',
            path: ['referenceNumber'],
        });
    }

    if (data.loanType === 'new') {
        const hasIdPhotos = data.idPhotos && data.idPhotos.length > 0;
        const hasDocuments = data.documents && data.documents.length > 0;
        const hasTypedText = data.typedText && data.typedText.trim() !== '';

        if (!hasIdPhotos && !hasDocuments && !hasTypedText) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please provide at least one piece of information: ID photo, supporting document, or loaner information.',
                path: ['typedText'], // Display error message near one of the fields
            });
        }
    }
});

const fileToDataUri = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
};

export type FormResult = {
  evaluation: EvaluateLoanApplicationOutput;
  idPhotoDataUris: string[];
  documentDataUris: string[];
};

export type FormState = {
  success: boolean;
  message: string;
  data?: FormResult;
};

export async function handleEvaluation(prevState: FormState, formData: FormData): Promise<FormState> {
  const idPhotoFiles = formData.getAll('idPhotos').filter((f): f is File => f instanceof File && f.size > 0);
  const documentFiles = formData.getAll('documents').filter((f): f is File => f instanceof File && f.size > 0);
  
  const validatedFields = formSchema.safeParse({
    loanType: formData.get('loanType'),
    referenceNumber: formData.get('referenceNumber') || undefined,
    idPhotos: idPhotoFiles.length > 0 ? idPhotoFiles : undefined,
    documents: documentFiles.length > 0 ? documentFiles : undefined,
    typedText: formData.get('typedText'),
  });
  
  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.flatten().fieldErrors;
    const formLevelErrors = validatedFields.error.flatten().formErrors;
    const allErrors = [
        ...formLevelErrors,
        ...Object.values(errorMessages).flat()
    ].join(', ');
    return {
      success: false,
      message: allErrors || 'Invalid form data.',
    };
  }

  try {
    const { loanType, idPhotos, documents, typedText } = validatedFields.data;
    let { referenceNumber } = validatedFields.data;
    let existingData: any = {};

    if (loanType === 'new') {
        referenceNumber = `ASENSO-${Date.now()}`;
    } else if (referenceNumber) {
        const docRef = doc(db, "loanApplications", referenceNumber);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            existingData = docSnap.data();
        } else {
            return { success: false, message: `Application with reference number ${referenceNumber} not found.` };
        }
    }

    if (!referenceNumber) {
        return { success: false, message: 'Reference number is missing.' };
    }
    
    const newIdPhotoDataUris = await Promise.all((idPhotos || []).map(fileToDataUri));
    const newDocumentDataUris = await Promise.all((documents || []).map(fileToDataUri));

    const combinedIdPhotoDataUris = [...(existingData.idPhotoDataUris || []), ...newIdPhotoDataUris];
    const combinedDocumentDataUris = [...(existingData.documentDataUris || []), ...newDocumentDataUris];
    
    const existingTypedText = existingData.typedText || '';
    const newTypedText = typedText || '';
    const combinedTypedText = [existingTypedText, newTypedText].filter(Boolean).join('\n\n');

    const result = await evaluateLoanApplication({
      referenceNumber,
      idPhotoDataUris: combinedIdPhotoDataUris,
      documentDataUris: combinedDocumentDataUris,
      typedText: combinedTypedText,
    });

    await setDoc(doc(db, "loanApplications", referenceNumber), {
      ...result,
      idPhotoDataUris: combinedIdPhotoDataUris,
      documentDataUris: combinedDocumentDataUris,
      typedText: combinedTypedText,
      lastEvaluatedAt: new Date(),
    }, { merge: true });

    return { 
        success: true, 
        message: 'Evaluation successful.', 
        data: {
          evaluation: result,
          idPhotoDataUris: combinedIdPhotoDataUris,
          documentDataUris: combinedDocumentDataUris,
        },
    };
  } catch (error) {
    console.error('Evaluation Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Evaluation failed: ${errorMessage}` };
  }
}

type GetCreditAdviceInput = {
    creditScore: number;
    isEligible: boolean;
    explanation: string;
    violationFlags: string[];
}

export async function getCreditAdvice(evaluation: GetCreditAdviceInput): Promise<string> {
  if (evaluation.isEligible) {
    return '';
  }
  try {
    const advice = await generateCreditAdvice({
        ...evaluation,
        referenceNumber: '',
        fullName: '',
        address: '',
        loanRequestSummary: '',
        creditScoreBreakdown: [],
        interestRate: 0,
        documentTypes: [],
        loanRecommendations: [],
    });
    return advice;
  } catch (error) {
    console.error('Credit Advice Error:', error);
    return 'We are currently unable to generate personalized advice. Please check back later.';
  }
}

export type LoginState = {
  success: boolean;
  message: string;
};

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required.'),
    password: z.string().min(1, 'Password is required.'),
});

export async function handleLogin(prevState: LoginState, formData: FormData): Promise<LoginState> {
    const validatedFields = loginSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
        const errorMessages = validatedFields.error.flatten().fieldErrors;
        const allErrors = Object.values(errorMessages).flat().join(', ');
        return {
            success: false,
            message: allErrors || 'Invalid login data.',
        };
    }

    const { username, password } = validatedFields.data;

    if (password !== 'password123') {
        return { success: false, message: 'Invalid username or password.' };
    }

    let path = '';
    switch (username) {
        case 'officer':
            path = '/dashboard';
            break;
        case 'admin':
            path = '/admin';
            break;
        case 'client':
            path = '/client';
            break;
        default:
            return { success: false, message: 'Invalid username or password.' };
    }

    redirect(path);
}
