'use server';

/**
 * @fileOverview This file defines a Genkit flow for modifying existing p5.js game code based on user prompts.
 *
 * - modifyGameCode - A function that accepts a prompt and existing code, and returns modified p5.js code.
 * - ModifyGameCodeInput - The input type for the modifyGameCode function.
 * - ModifyGameCodeOutput - The return type for the modifyGameCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModifyGameCodeInputSchema = z.object({
  prompt: z.string().describe('The prompt to use to modify the existing p5.js game code.'),
  currentCode: z.string().describe('The current p5.js game code.'),
});
export type ModifyGameCodeInput = z.infer<typeof ModifyGameCodeInputSchema>;

const ModifyGameCodeOutputSchema = z.object({
  thoughts: z.string().describe('A step-by-step explanation of the thought process for modifying the code, in markdown format.'),
  modifiedCode: z.string().describe('The modified p5.js game code.'),
});
export type ModifyGameCodeOutput = z.infer<typeof ModifyGameCodeOutputSchema>;

export async function modifyGameCode(input: ModifyGameCodeInput): Promise<ModifyGameCodeOutput> {
  return modifyGameCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'modifyGameCodePrompt',
  input: {schema: ModifyGameCodeInputSchema},
  output: {schema: ModifyGameCodeOutputSchema},
  prompt: `You are an expert p5.js game developer. Your output must be a JSON object with two fields: "thoughts" and "modifiedCode".
  
In the "thoughts" field, provide a step-by-step thinking process on how you will modify the code based on the user's prompt, formatted in markdown.

In the "modifiedCode" field, you must return the modified code based on the prompt. Return ONLY the javascript code that would go inside a p5.js sketch function where the p5 instance is passed as an argument 'p'. You must define 'p.setup' and 'p.draw' functions. DO NOT include a call to 'p.createCanvas()'. The canvas will be created and managed for you. All other p5 functions must be prefixed with 'p.'. IMPORTANT: Any variables that rely on canvas dimensions like 'p.width' or 'p.height' MUST be initialized inside the 'p.setup()' function. Initializing them at the top level will cause a crash because the canvas does not exist yet. The game must support both keyboard/mouse and mobile touchscreen controls. Do not add any comments or explanations in the code.

Existing code:
{{{currentCode}}}

Prompt:
{{{prompt}}}`,
});

const modifyGameCodeFlow = ai.defineFlow(
  {
    name: 'modifyGameCodeFlow',
    inputSchema: ModifyGameCodeInputSchema,
    outputSchema: ModifyGameCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
