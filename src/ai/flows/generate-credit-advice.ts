
'use server';

/**
 * @fileOverview An AI agent for generating credit score improvement advice.
 *
 * - generateCreditAdvice - A function that generates advice based on loan evaluation results.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { EvaluateLoanApplicationOutputSchema, type EvaluateLoanApplicationOutput } from '@/ai/schemas';

export async function generateCreditAdvice(evaluation: EvaluateLoanApplicationOutput): Promise<string> {
    return generateCreditAdviceFlow(evaluation);
}

const prompt = ai.definePrompt({
  name: 'generateCreditAdvicePrompt',
  input: {schema: EvaluateLoanApplicationOutputSchema.extend({
      violationsText: z.string()
  })},
  output: {schema: z.string()},
  prompt: `You are an empathetic and helpful financial advisor for a microfinance institution. An applicant has been evaluated for a loan and did not get a high enough credit score. Your task is to provide them with clear, actionable, and encouraging advice on how to improve their credit score based on their evaluation results.

  Applicant's Evaluation:
  - Credit Score: {{{creditScore}}}
  - Eligibility: {{{isEligible}}}
  - Explanation from AI: {{{explanation}}}
  - Violations Flagged: {{{violationsText}}}

  Based on the information above, generate a list of 2-3 specific, actionable recommendations for the applicant. Frame the advice positively and focus on steps they can realistically take. For example, if there were document inconsistencies, advise them to ensure all documents have matching information. If their income was low, suggest ways to document all sources of income.

  Format your response as a markdown bulleted list (using '*' for bullets).
`,
});

const generateCreditAdviceFlow = ai.defineFlow(
  {
    name: 'generateCreditAdviceFlow',
    inputSchema: EvaluateLoanApplicationOutputSchema,
    outputSchema: z.string(),
  },
  async (evaluation) => {
    const violationsText = evaluation.violationFlags.length > 0
      ? evaluation.violationFlags.join(', ')
      : 'None';

    const {output} = await prompt({...evaluation, violationsText});

    return output ?? 'We are unable to provide specific advice at this time. Please ensure all your documents are consistent and up-to-date.';
  }
);
