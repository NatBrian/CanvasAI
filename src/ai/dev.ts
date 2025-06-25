import { config } from 'dotenv';
config();

import '@/ai/flows/modify-game-code.ts';
import '@/ai/flows/generate-game-code.ts';
import '@/ai/flows/fix-game-code-errors.ts';