#!/usr/bin/env node

import 'dotenv/config';
import { existsSync } from 'node:fs';

// Ensure called correctly
let inFile = process.argv[2];
if(!inFile) { console.log('usage: ./script.js input_file'); process.exit(1) }
if(!existsSync(inFile)) { console.error(`Error: ${inFile} does not exist`); process.exit(1) }

// Setup credentials
let KEY1 = process.env.KEY1
let KEY2 = process.env.KEY2
let LOCATION = process.env.LOCATION
let ENDPOINT = process.env.ENDPOINT

// Check credentials
if(! [KEY1, 
      KEY2,
      LOCATION, 
      ENDPOINT].every(
        Boolean
      )
) { console.error('Error: credentials not set'); process.exit(1) }


