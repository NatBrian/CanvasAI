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

In the "modifiedCode" field, you must return the ENTIRE modified code based on the user's prompt and the existing code.

Existing code:
{{{currentCode}}}

Prompt:
{{{prompt}}}

### **CRITICAL CODE REQUIREMENTS**
**CRITICAL: The modified code MUST strictly follow ALL of these rules without deviation. Failure to adhere to any rule will result in an invalid output. These rules override all other common coding conventions.**

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

8.  **Control Scheme**
    * The game must support both keyboard/mouse and mobile touchscreen controls.
`,
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
