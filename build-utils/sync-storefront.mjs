import { exec } from 'child_process';
import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'SWELL_STORE_ID',
  'SWELL_STOREFRONT_ID',
  'SWELL_SECRET_KEY',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing ${envVar}`);
  }
});

function executeCommand(command) {
  exec(
    command.join(' '),
    { env: { ...process.env } },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }

      console.log(stdout || stderr);
    },
  );
}

executeCommand([
  'swell storefronts toggle-editor',
  `--id $SWELL_STOREFRONT_ID`,
  '--theme-id origin',
  '--enable true',
  `--secret-key $SWELL_SECRET_KEY`,
  `--store $SWELL_STORE_ID`,
]);

executeCommand([
  'swell storefronts push',
  '--id $SWELL_STOREFRONT_ID',
  '-t editor',
  '-f ./config/editor.json',
  '--secret-key $SWELL_SECRET_KEY',
  '--store $SWELL_STORE_ID',
]);

executeCommand([
  'swell storefronts push',
  '--id $SWELL_STOREFRONT_ID',
  '-t settings',
  '-f ./config/defaults.json',
  '--secret-key $SWELL_SECRET_KEY',
  '--store $SWELL_STORE_ID',
]);

fs.readdirSync('./config/content').forEach((file) => {
  executeCommand([
    'swell model push -c',
    `-f ./config/content/${file}`,
    '--secret-key $SWELL_SECRET_KEY',
    '--store $SWELL_STORE_ID',
  ]);
});
