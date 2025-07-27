/* eslint-disable n/no-process-env */

import path from 'path';
import dotenv from 'dotenv';
import moduleAlias from 'module-alias';

// Check the env
const NODE_ENV = (process.env.NODE_ENV ?? 'dev');

// ✅ Configure "dotenv" FIRST
let result2;
if (NODE_ENV === 'dev') {
  result2 = dotenv.config({
    path: path.resolve(process.cwd(), '.env'),
  });
} else {
  result2 = dotenv.config({
    path: path.resolve(process.cwd(), `.env.${NODE_ENV}`),
  });
}
if (result2.error) {
  throw result2.error;
}

// ✅ THEN print the values (after dotenv.config)
console.log('[DEBUG] Loaded NODE_ENV:', NODE_ENV);
console.log('[DEBUG] Loaded MONGO_URI:', process.env.MONGO_URI);

// Configure moduleAlias
if (__filename.endsWith('js')) {
  moduleAlias.addAlias('@src', __dirname + '/dist');
}