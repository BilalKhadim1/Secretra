const fs = require('fs');
const path = require('path');

const secret = process.env.GOOGLE_SERVICES_JSON_BASE64;

if (secret) {
  console.log('Detected GOOGLE_SERVICES_JSON_BASE64. Recreating google-services.json...');
  try {
    const buffer = Buffer.from(secret, 'base64');
    fs.writeFileSync(path.join(__dirname, '..', 'google-services.json'), buffer);
    console.log('Successfully recreated google-services.json');
  } catch (error) {
    console.error('Failed to recreate google-services.json:', error);
    process.exit(1);
  }
} else {
  console.log('GOOGLE_SERVICES_JSON_BASE64 not found in environment.');
  // If we are in local development and the file already exists, that's fine.
  // If we are in EAS and the file is missing, the build will eventually fail but we don't block here.
}
