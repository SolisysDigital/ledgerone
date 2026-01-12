// Test setup file
// Load environment variables for testing
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local or .env file
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });
