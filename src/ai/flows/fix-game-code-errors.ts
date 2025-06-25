// src/ai/flows/fix-game-code-errors.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow to fix errors in generated p5.js code.
 *
 * - fixGeneratedGameCodeErrors - A function that takes potentially broken p5.js code and an error message, and attempts to fix it.
 * - FixGeneratedGameCodeErrorsInput - The input type for the fixGeneratedGameCodeErrors function.
 * - FixGeneratedGameCodeErrorsOutput - The return type for the fixGeneratedGameCodeErrors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FixGeneratedGameCodeErrorsInputSchema = z.object({
  code: z.string().describe('The p5.js code to fix.'),
  errorMessage: z.string().describe('The error message from the p5.js runtime.'),
});
export type FixGeneratedGameCodeErrorsInput = z.infer<
  typeof FixGeneratedGameCodeErrorsInputSchema
>;

const FixGeneratedGameCodeErrorsOutputSchema = z.object({
  thoughts: z.string().describe('A step-by-step explanation of how the code was fixed, in markdown format.'),
  fixedCode: z.string().describe('The fixed p5.js code.'),
});
export type FixGeneratedGameCodeErrorsOutput = z.infer<
  typeof FixGeneratedGameCodeErrorsOutputSchema
>;

export async function fixGeneratedGameCodeErrors(
  input: FixGeneratedGameCodeErrorsInput
): Promise<FixGeneratedGameCodeErrorsOutput> {
  return fixGeneratedGameCodeErrorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fixGeneratedGameCodeErrorsPrompt',
  input: {schema: FixGeneratedGameCodeErrorsInputSchema},
  output: {schema: FixGeneratedGameCodeErrorsOutputSchema},
  prompt: `You are an AI code assistant that helps to fix errors in p5.js code. Your output must be a JSON object with two fields: "thoughts" and "fixedCode".

In the "thoughts" field, provide a step-by-step thinking process on how you will fix the code, formatted in markdown.

In the "fixedCode" field, provide the corrected p5.js code. You will be given p5.js code that contains errors and the corresponding error message. Your goal is to fix the errors and return only the fixed p5.js code. All p5 functions must be prefixed with 'p.'. DO NOT include a call to 'p.createCanvas()', as it is handled outside this code. IMPORTANT: Any variables that rely on canvas dimensions like 'p.width' or 'p.height' MUST be initialized inside the 'p.setup()' function. Initializing them at the top level will cause a crash because the canvas does not exist yet. Do not add any comments or explanations in the code.

The p5.js code is:
{{{code}}}

The error was:
{{{errorMessage}}}
  `,
});

const fixGeneratedGameCodeErrorsFlow = ai.defineFlow(
  {
    name: 'fixGeneratedGameCodeErrorsFlow',
    inputSchema: FixGeneratedGameCodeErrorsInputSchema,
    outputSchema: FixGeneratedGameCodeErrorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
