
'use server';

/**
 * @fileOverview An AI agent for evaluating loan applications.
 *
 * - evaluateLoanApplication - A function that handles the loan application evaluation process.
 * - EvaluateLoanApplicationInput - The input type for the evaluateLoanApplication function.
 * - EvaluateLoanApplicationOutput - The return type for the evaluateLoanApplication function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { EvaluateLoanApplicationOutputSchema, type EvaluateLoanApplicationOutput } from '@/ai/schemas';

const EvaluateLoanApplicationInputSchema = z.object({
  referenceNumber: z.string().describe('A unique reference number for the application.'),
  idPhotoDataUris: z
    .array(z.string())
    .optional()
    .describe(
      "A list of photos of the applicant's ID, each as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  documentDataUris: z
    .array(z.string())
    .optional()
    .describe(
      'A list of supporting documents, each as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
  typedText: z.string().optional().describe('Additional information about the applicant, which may include existing profile data and new notes.'),
});
export type EvaluateLoanApplicationInput = z.infer<typeof EvaluateLoanApplicationInputSchema>;

// In a real application, these rules would be managed by an administrator
// and stored securely, for example, in environment variables or a database.
const BANK_RULES = `
- Minimum credit score: 600
- Maximum Debt-to-Income ratio: 45%
- Applicant must have a stable income source.
- No bankruptcies in the last 7 years.
- Loan amount cannot exceed 30% of annual income.
`;

export async function evaluateLoanApplication(
  input: EvaluateLoanApplicationInput
): Promise<EvaluateLoanApplicationOutput> {
  return evaluateLoanApplicationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateLoanApplicationPrompt',
  input: {
    schema: EvaluateLoanApplicationInputSchema.extend({
      bankRules: z.string().describe('The bank rules for loan eligibility.'),
    }),
  },
  output: {schema: EvaluateLoanApplicationOutputSchema},
  prompt: `You are an AI assistant for a loan officer evaluating loan applications for a microfinance institution in the Philippines. Your applicants are typically from underprivileged backgrounds. Be empathetic and fair in your assessment. Your role is to assist the loan officer by analyzing the applicant's complete profile, which may include previously submitted information and new documents.

  Analyze the following information to determine the applicant's credit score and eligibility.
  From the provided information, extract the applicant's full name and address. If you cannot find a name, leave the fullName field empty.
  From the 'typedText' and documents, extract a brief, one-sentence summary of what the client is asking for (e.g., "Requesting a ₱10,000 loan for a small business startup."). Populate the 'loanRequestSummary' field with this summary.
  
  Also, identify the type of each ID and document provided (e.g., "Voter's ID", "School ID", "Proof of Billing"). Populate the 'documentTypes' field with your findings.

  IMPORTANT: Verify that the applicant's full name and address are consistent across all provided ID photos and documents. Also, check that the information on the ID photos (e.g., name, birth date) matches the information on the supporting documents. If there are any mismatches, add a flag to the 'violationFlags' output detailing the inconsistency for the loan officer to review.

  Application Reference Number: {{{referenceNumber}}}

  {{#if idPhotoDataUris}}
  ID Photos:
  {{#each idPhotoDataUris}}
    {{media url=this}}
  {{/each}}
  {{/if}}
  {{#if documentDataUris}}
  Documents:
  {{#each documentDataUris}}
    {{media url=this}}
  {{/each}}
  {{/if}}
  {{#if typedText}}
  Additional Information from applicant's profile and new notes: {{{typedText}}}
  {{/if}}
  
  Bank Rules: {{{bankRules}}}

  Based on the entire profile (including any previous and new information) and bank rules, generate a credit score, determine eligibility, explain the decision, and list any violations (including information mismatches).

  After determining the credit score, you MUST generate a 'creditScoreBreakdown'. This breakdown should be an array of objects, where each object contains a 'factor' (a string) and 'points' (a number). Use clear, descriptive factor names (e.g., "Income Stability", "Document Consistency", "Credit History"). Only include factors for which you have information. For example, if no income information is provided, do not include "Income Stability" in the breakdown. The sum of the points in the breakdown should be close to the final creditScore.
  
  If the applicant is eligible, provide 2-3 realistic loan amount recommendations. The recommendations should be based on the applicant's inferred income and the bank rule that the loan amount cannot exceed 30% of annual income. For each recommendation, provide the loan amount, a suggested term (e.g., '12 months', '24 months'), and an estimated monthly payment. Populate the 'loanRecommendations' field with these suggestions. If the applicant is not eligible, return an empty array for this field.

  Ensure the explanation is in plain language, formatted as a markdown bulleted list (using '*' for bullets), and highlights key factors and any violations for the loan officer.

  Return the applicant's reference number, full name, address, loan request summary, credit score as a number, credit score breakdown, eligibility as a boolean, explanation as a string, violation flags as an array of strings, interest rate as a number, the identified document types as an array of strings, and the loan recommendations.
`,
});

const evaluateLoanApplicationFlow = ai.defineFlow(
  {
    name: 'evaluateLoanApplicationFlow',
    inputSchema: EvaluateLoanApplicationInputSchema,
    outputSchema: EvaluateLoanApplicationOutputSchema,
  },
  async input => {
    const {output} = await prompt({...input, bankRules: BANK_RULES});
    if (!output) {
        throw new Error("AI failed to return an output.");
    }

    // Validate that an applicant name was found.
    if (!output.fullName || output.fullName.trim() === '') {
      throw new Error("Applicant name could not be determined. The application is invalid.");
    }
    
    return output;
  }
);
