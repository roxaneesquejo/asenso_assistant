
import {z} from 'genkit';

export const EvaluateLoanApplicationOutputSchema = z.object({
    referenceNumber: z.string().describe("The unique reference number for the application."),
    fullName: z.string().describe("The full name of the applicant."),
    address: z.string().describe("The address of the applicant."),
    loanRequestSummary: z.string().describe("A brief, one-sentence summary of what the loan is for."),
    creditScore: z.number().describe('The credit score of the applicant.'),
    creditScoreBreakdown: z.array(z.object({
        factor: z.string().describe("The name of the credit scoring factor (e.g., 'Income Stability', 'Document Consistency')."),
        points: z.number().describe("The points contributed by this factor to the total score.")
    })).describe('A breakdown of the credit score, with each object representing a factor and its point contribution.'),
    isEligible: z.boolean().describe('Whether the applicant is eligible for a loan.'),
    explanation: z.string().describe('An explanation of the credit scoring and eligibility decision, formatted as a markdown bulleted list.'),
    violationFlags: z.array(z.string()).describe('Any violations of the lending criteria.'),
    interestRate: z.number().describe('The interest rate for the loan.'),
    documentTypes: z.array(z.string()).describe('The types of IDs and documents identified (e.g., Voters ID, School ID).'),
    loanRecommendations: z.array(z.object({
        amount: z.number().describe("The recommended loan amount."),
        term: z.string().describe("The suggested loan term (e.g., '12 months')."),
        monthlyPayment: z.number().describe("The estimated monthly payment."),
    })).describe("A list of loan amount recommendations based on the applicant's profile.")
});
export type EvaluateLoanApplicationOutput = z.infer<typeof EvaluateLoanApplicationOutputSchema>;
