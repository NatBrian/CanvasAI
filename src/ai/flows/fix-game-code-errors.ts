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
  apiKey: z.string().optional().describe('The Gemini API key.'),
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

In the "fixedCode" field, provide the corrected p5.js code. You will be given p5.js code that contains errors and the corresponding error message. Your goal is to fix the errors and return only the fixed p5.js code.

The p5.js code is:
{{{code}}}

The error was:
{{{errorMessage}}}

### **CRITICAL CODE REQUIREMENTS**
**CRITICAL: The fixed code MUST strictly follow ALL of these rules without deviation. Failure to adhere to any rule will result in an invalid output. These rules override all other common coding conventions.**

1.  **Execution Context (No \`new p5\`)**
    * DO NOT generate code that uses \`let p5 = new p5(...)\`, \`new p5()\`, or any other instantiation of p5.
    * You must assume the code will be executed in a context where a \`p\` instance object is already globally available and configured.

2.  **File Structure (Single Raw Script)**
    * The entire output MUST be a single block of raw Javascript code.
    * DO NOT wrap the script in any outer function, such as the common \`(p) => { ... }\` instance mode wrapper. The code must begin with \`let\` variable declarations or \`function\` definitions at the top level.

3.  **Mandatory \`p.\` Prefix**
    * ALL native p5.js functions, properties, and constants (e.g., \`createCanvas\`, \`background\`, \`fill\`, \`rect\`, \`width\`, \`height\`, \`keyCode\`, \`LEFT_ARROW\`, \`mouseX\`, \`mouseY\`, \`random\`, \`floor\`, \`color\`) MUST be prefixed with \`p.\` (e.g., \`p.background()\`, \`p.width\`, \`p.random()\`).
    * This rule is absolute. There are no exceptions.

4.  **Function Definition & Assignment Rules**
    * **p5.js Lifecycle Functions**: Core p5.js event functions (\`setup\`, \`draw\`, \`mousePressed\`, \`mouseReleased\`, \`keyPressed\`, etc.) MUST be defined as **arrow functions** and assigned directly to the \`p\` instance.
        * **Correct:** \`p.setup = () => { ... };\`
        * **Correct:** \`p.draw = () => { ... };\`
        * **INCORRECT:** \`function setup() { ... }\` or \`this.setup = function() { ... }\`
    * **Custom Helper/Constructor Functions**: All other functions you write for logic, objects, or calculations can be defined using standard \`function Name() {}\` or ES6 \`class\` syntax.

5.  **Variable Initialization Scope**
    * Any variable that requires the p5.js canvas or environment to be initialized (i.e., depends on \`p.width\`, \`p.height\`, or other values set in \`setup\`) MUST be initialized *inside* the \`p.setup()\` function.
    * You may declare the variable at the global top level (e.g., \`let snake;\`), but its assignment/instantiation MUST occur within \`p.setup()\` (e.g., \`snake = new Snake();\`).

6.  **Canvas Management**
    * DO NOT include a call to \`p.createCanvas()\`. The canvas is created and managed externally.
    
7.  **No Comments**
    * Do not add any comments or explanations in the code.
  `,
});

const fixGeneratedGameCodeErrorsFlow = ai.defineFlow(
  {
    name: 'fixGeneratedGameCodeErrorsFlow',
    inputSchema: FixGeneratedGameCodeErrorsInputSchema,
    outputSchema: FixGeneratedGameCodeErrorsOutputSchema,
  },
  async input => {
    const model = ai.getModel({
      model: 'googleai/gemini-2.0-flash',
      auth: {apiKey: input.apiKey!},
    });
    const {output} = await prompt(input, { model });
    return output!;
  }
);
