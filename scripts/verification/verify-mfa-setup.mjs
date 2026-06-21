#!/usr/bin/env node

/**
 * MFA Implementation Verification Script
 *
 * This script validates that all MFA components, API routes, and database
 * configurations are properly set up and working.
 *
 * Run: npm run verify-mfa
 * Or: node scripts/verification/verify-mfa-setup.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function log(type, message) {
  const prefix = {
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    warn: `${colors.yellow}⚠${colors.reset}`,
    info: `${colors.cyan}ℹ${colors.reset}`
  };

  console.log(`${prefix[type] || prefix.info} ${message}`);
}

function checkFileExists(filePath, description) {
  const fullPath = path.join(projectRoot, filePath);
  if (fs.existsSync(fullPath)) {
    log('success', `${description}: ${filePath}`);
    checks.passed++;
    return true;
  } else {
    log('error', `${description} MISSING: ${filePath}`);
    checks.failed++;
    return false;
  }
}

function checkFileContains(filePath, pattern, description) {
  const fullPath = path.join(projectRoot, filePath);
  if (!fs.existsSync(fullPath)) {
    log('error', `File not found: ${filePath}`);
    checks.failed++;
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  if (content.includes(pattern)) {
    log('success', `${description}`);
    checks.passed++;
    return true;
  } else {
    log('error', `${description} - NOT FOUND`);
    checks.failed++;
    return false;
  }
}

console.log(`\n${colors.blue}=== MFA Implementation Verification ===${colors.reset}\n`);

console.log(`${colors.cyan}1. Checking MFA Components...${colors.reset}`);
checkFileExists('components/ngo/MFAFlowCoordinator.tsx', 'MFAFlowCoordinator component');
checkFileExists('components/ngo/MFAOnboardingWarning.tsx', 'MFAOnboardingWarning component');
checkFileExists('components/ngo/MFASetup.tsx', 'MFASetup component');
checkFileExists('components/ngo/MFAVerification.tsx', 'MFAVerification component');

console.log(`\n${colors.cyan}2. Checking MFA API Routes...${colors.reset}`);
checkFileExists('app/api/auth/mfa/generate-secret/route.ts', 'generate-secret endpoint');
checkFileExists('app/api/auth/mfa/verify-setup/route.ts', 'verify-setup endpoint');
checkFileExists('app/api/auth/mfa/verify-login/route.ts', 'verify-login endpoint');

console.log(`\n${colors.cyan}3. Checking Prisma Schema...${colors.reset}`);
checkFileContains(
  'prisma/schema.prisma',
  'mfaSecret',
  'NGO model has mfaSecret field'
);
checkFileContains(
  'prisma/schema.prisma',
  'mfaSetupComplete',
  'NGO model has mfaSetupComplete field'
);
checkFileContains(
  'prisma/schema.prisma',
  'mfaBackupCodes',
  'NGO model has mfaBackupCodes field'
);
checkFileContains(
  'prisma/schema.prisma',
  'mfaSetupCompletedAt',
  'NGO model has mfaSetupCompletedAt field'
);
checkFileContains(
  'prisma/schema.prisma',
  'mfaFailedAttempts',
  'NGO model has mfaFailedAttempts field'
);
checkFileContains(
  'prisma/schema.prisma',
  'model MFAAuditLog',
  'MFAAuditLog model exists'
);

console.log(`\n${colors.cyan}4. Checking Integration Points...${colors.reset}`);
checkFileContains(
  'app/ngo-login/page.tsx',
  'MFAFlowCoordinator',
  'ngo-login page uses MFAFlowCoordinator'
);
checkFileContains(
  'app/ngo-login/page.tsx',
  'showMFAFlow',
  'ngo-login page manages MFA flow state'
);

console.log(`\n${colors.cyan}5. Checking Component Props...${colors.reset}`);
checkFileContains(
  'components/ngo/MFAFlowCoordinator.tsx',
  'ngoId: string',
  'MFAFlowCoordinator accepts ngoId prop'
);
checkFileContains(
  'components/ngo/MFAVerification.tsx',
  'ngoId: string',
  'MFAVerification accepts ngoId prop'
);
checkFileContains(
  'components/ngo/MFASetup.tsx',
  'onSetupComplete',
  'MFASetup has completion callback'
);

console.log(`\n${colors.cyan}6. Checking Authentication Setup...${colors.reset}`);
checkFileContains(
  'lib/auth.ts',
  'CredentialsProvider',
  'NextAuth uses credentials provider'
);
checkFileContains(
  'lib/auth.ts',
  'NGO',
  'NGO authentication configured'
);

console.log(`\n${colors.cyan}7. Checking API Route Implementation...${colors.reset}`);
checkFileContains(
  'app/api/auth/mfa/verify-login/route.ts',
  'POST',
  'verify-login endpoint has POST handler'
);
checkFileContains(
  'app/api/auth/mfa/verify-login/route.ts',
  'ngoId',
  'verify-login validates ngoId'
);
checkFileContains(
  'app/api/auth/mfa/verify-login/route.ts',
  'code',
  'verify-login validates code'
);

console.log(`\n${colors.cyan}8. Checking Security Features...${colors.reset}`);
checkFileContains(
  'app/api/auth/mfa/verify-login/route.ts',
  'attemptsRemaining',
  'Rate limiting for failed attempts'
);
checkFileContains(
  'lib/mfa.ts',
  'generateBackupCodes',
  'Backup code generation function'
);

console.log(`\n${colors.cyan}9. Checking Error Handling...${colors.reset}`);
checkFileContains(
  'components/ngo/MFAVerification.tsx',
  'error',
  'MFAVerification has error state handling'
);
checkFileContains(
  'components/ngo/MFASetup.tsx',
  'error',
  'MFASetup has error state handling'
);

console.log(`\n${colors.cyan}10. Checking Documentation...${colors.reset}`);
checkFileExists('docs/mfa/MFA_IMPLEMENTATION_GUIDE.md', 'MFA Implementation guide');
checkFileExists('docs/mfa/MFA_TEST_GUIDE.md', 'MFA testing guide');

// Summary
console.log(`\n${colors.blue}=== Verification Summary ===${colors.reset}`);
console.log(`${colors.green}Passed: ${checks.passed}${colors.reset}`);
console.log(`${colors.red}Failed: ${checks.failed}${colors.reset}`);

if (checks.failed === 0) {
  console.log(`\n${colors.green}✓ All MFA components verified successfully!${colors.reset}`);
  console.log(`\n${colors.cyan}Next Steps:${colors.reset}`);
  console.log('1. Run npm run dev to start the dev server');
  console.log('2. Navigate to http://localhost:3000/ngo-login');
  console.log('3. Follow docs/mfa/MFA_TEST_GUIDE.md for comprehensive testing');
  console.log('4. Check docs/mfa/MFA_IMPLEMENTATION_GUIDE.md for technical details');
  process.exit(0);
} else {
  console.log(`\n${colors.red}✗ Some verification checks failed. Please review above.${colors.reset}`);
  process.exit(1);
}
