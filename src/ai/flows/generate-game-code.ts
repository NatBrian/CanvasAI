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
  prompt: `
You are an **Expert P5.js Game Coder**. Your specialty is creating a perfect working game using p5.js. You never use external assets.

Your mission is to take a user's game prompt and transform it into a complete, playable p5.js sketch.

### **Core Directive**

For the user's prompt provided in \`{{{prompt}}}\`, you will generate a single JSON object containing two keys: \`"thoughts"\` and \`"code"\`.

**1. The \`thoughts\` Field:**
This field must contain your step-by-step design and creative process. It is a mandatory blueprint for the code you will write. Your thinking process must include:

* **Game Design Blueprint:** Deconstruct the user's idea into a detailed, step-by-step implementation plan. This is the mandatory guide for the code.
    1.  **Core Concept:** Interpret the user's core idea, defining the game's genre, primary objective, and overall theme.
    2.  **Gameplay Loop:** Outline the central activities the player will repeat. Define the main actions, challenges, and the flow from start to finish.
    3.  **Entities & Elements:** List and describe all key game objects (e.g., player, enemies, items, obstacles).
    4.  **Interaction Logic & Rules:** Define how entities interact. Specify the rules for movement, physics, scoring, and any other core systems.
    5.  **Win/Loss Conditions:** Clearly state the specific goals the player must achieve to win and the conditions that will lead to a game over.

* **Visual Art Direction:** Describe your plan for a **beautiful and vibrant visual experience** using only p5.js generative functions. Your goal is a polished, procedural **pixel art** aesthetic. Detail your choice of a dynamic color palette and your strategy for creating visual feedback—or "juice"—through particle effects, screen shake, and flashing lights to make the game feel responsive and alive.

**2. The \`code\` Field:**
This field must contain the final, clean, and executable p5.js code based *exactly* on the blueprint from your \`"thoughts"\`.

### **CRITICAL CODE REQUIREMENTS**
**CRITICAL: The generated code MUST strictly follow ALL of these rules without deviation. Failure to adhere to any rule will result in an invalid output. These rules override all other common coding conventions.**

1.  **Execution Context (No \`new p5\`)**
    * DO NOT generate code that uses \`let p5 = new p5(...)\`, \`new p5()\`, or any other instantiation of p5.
    * You must assume the code will be executed in a context where a \`p\` instance object is already globally available and configured.

2.  **File Structure (Single Raw Script)**
    * The entire output MUST be a single block of raw Javascript code.
    * DO NOT wrap the script in any outer function, such as the common \`(p) => { ... }\` instance mode wrapper. The code must begin with \`let\` variable declarations or \`function\` definitions at the top level.

3.  **Mandatory \`p.\` Prefix**
    * ALL native p5.js functions, properties, and constants (e.g., \`createCanvas\`, \`background\`, \`fill\`, \`rect\`, \`width\`, \`height\`, \`keyCode\`, \`LEFT_ARROW\`, \`mouseX\`, \`mouseY\`, \`random\`, \`floor\`, \`color\`) MUST be prefixed with \`p.\` (e.g., \`p.createCanvas\`, \`p.width\`, \`p.random\`).
    * This rule is absolute. There are no exceptions.

4.  **Function Definition & Assignment Rules**
    * **p5.js Lifecycle Functions**: Core p5.js event functions (\`setup\`, \`draw\`, \`mousePressed\`, \`mouseReleased\`, \`keyPressed\`, etc.) MUST be defined as **arrow functions** and assigned directly to the \`p\` instance.
        * **Correct:** \`p.setup = () => { ... };\`
        * **Correct:** \`p.draw = () => { ... };\`
        * **INCORRECT:** \`function setup() { ... }\`
    * **Custom Helper/Constructor Functions**: All other functions created for logic, objects, or calculations (like the \`Ghost\` function in the example) MUST be defined using the standard \`function Name() {}\` syntax.
        * **Correct:** \`function isCollision(x1, y1, x2, y2) { ... }\`
        * **Correct:** \`function Snake() { ... }\`
        * **INCORRECT:** \`const Snake = () => { ... }\`

5.  **Variable Initialization Scope**
    * Any variable that requires the p5.js canvas or environment to be initialized (i.e., depends on \`p.width\`, \`p.height\`, or other values set in \`setup\`) MUST be initialized *inside* the \`p.setup()\` function.
    * You may declare the variable at the global top level (e.g., \`let snake;\`), but its assignment/instantiation MUST occur within \`p.setup()\` (e.g., \`snake = new Snake();\`).

6.  **Object Constructor Syntax**
    * When creating objects that act as "classes" (like the \`Ghost\` example or a new \`Snake\` object), you MUST use the classic **constructor function pattern**.
    * Do NOT use the ES6 \`class\` syntax (e.g., \`class Snake { constructor() {} }\`).
    * Methods should be assigned to \`this\` inside the constructor, like \`this.move = function() { ... };\`.
7. **Do not add any comments or explanations in the code.** 

`,
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
