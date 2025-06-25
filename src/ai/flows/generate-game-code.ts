'use server';

/**
 * @fileOverview Generates the initial p5.js code for a game based on a user prompt.
 *
 * - generateInitialGameCode - A function that generates the p5.js code.
 * - GenerateInitialGameCodeInput - The input type for the generateInitialGameCode function.
 * - GenerateInitialGameCodeOutput - The return type for the generateInitialGameCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialGameCodeInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the game concept.'),
});
export type GenerateInitialGameCodeInput = z.infer<typeof GenerateInitialGameCodeInputSchema>;

const GenerateInitialGameCodeOutputSchema = z.object({
  thoughts: z.string().describe('A step-by-step explanation of the thought process for generating the code, in markdown format.'),
  code: z.string().describe('The generated p5.js code for the game.'),
});
export type GenerateInitialGameCodeOutput = z.infer<typeof GenerateInitialGameCodeOutputSchema>;

export async function generateInitialGameCode(input: GenerateInitialGameCodeInput): Promise<GenerateInitialGameCodeOutput> {
  return generateGameCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInitialGameCodePrompt',
  input: {schema: GenerateInitialGameCodeInputSchema},
  output: {schema: GenerateInitialGameCodeOutputSchema},
  prompt: `You are a p5.js game code generator. Your output must be a JSON object with two fields: "thoughts" and "code".

In the "thoughts" field, provide a step-by-step thinking process on how you will approach the problem, formatted in markdown.

In the "code" field, generate the p5.js code for a game based on the following prompt: {{{prompt}}}. The code should ONLY be the javascript that would go inside a p5.js sketch function where the p5 instance is passed as an argument 'p'. You must define 'p.setup' and 'p.draw' functions. DO NOT include a call to 'p.createCanvas()'. All other p5 functions must be prefixed with 'p.'. IMPORTANT: Any variables that rely on canvas dimensions like 'p.width' or 'p.height' MUST be initialized inside the 'p.setup()' function. Initializing them at the top level will cause a crash because the canvas does not exist yet. The game must support both keyboard/mouse and mobile touchscreen controls. Do not add any comments or explanations in the code.`,
});

const generateGameCodeFlow = ai.defineFlow(
  {
    name: 'generateGameCodeFlow',
    inputSchema: GenerateInitialGameCodeInputSchema,
    outputSchema: GenerateInitialGameCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
