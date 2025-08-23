#!/usr/bin/env node

import chalk from 'chalk';
import { execSync } from 'child_process';

interface ValidationCheck {
  name: string;
  command: string;
  emoji: string;
}

console.log(chalk.blue('🔍 Running validation checks...\n'));

const checks: ValidationCheck[] = [
  {
    name: 'TypeScript Type Check',
    command: 'npm run type-check',
    emoji: '📝',
  },
  {
    name: 'Svelte Check',
    command: 'npm run check',
    emoji: '🔧',
  },
  {
    name: 'ESLint Check',
    command: 'npm run lint',
    emoji: '🔍',
  },
  {
    name: 'Prettier Format Check',
    command: 'npm run format:check',
    emoji: '💅',
  },
];

let hasErrors = false;

// First, run auto-fixes (these don't fail validation)
console.log(chalk.yellow('🔧 Running auto-fixes...'));

try {
  console.log(chalk.cyan('  → Running ESLint auto-fix...'));
  execSync('npm run lint:fix', { stdio: 'inherit' });
  console.log(chalk.green('  ✅ ESLint auto-fix completed'));
} catch {
  console.log(chalk.yellow('  ⚠️  ESLint auto-fix had issues, continuing...'));
}

try {
  console.log(chalk.cyan('  → Running Prettier auto-format...'));
  execSync('npm run format', { stdio: 'inherit' });
  console.log(chalk.green('  ✅ Prettier auto-format completed'));
} catch {
  console.log(chalk.yellow('  ⚠️  Prettier auto-format had issues, continuing...'));
}

console.log();

// Then run validation checks
for (const check of checks) {
  try {
    console.log(chalk.yellow(`${check.emoji} Running ${check.name}...`));
    execSync(check.command, { stdio: 'inherit' });
    console.log(chalk.green(`✅ ${check.name} passed\n`));
  } catch {
    console.log(chalk.red(`❌ ${check.name} failed\n`));
    hasErrors = true;
  }
}

if (hasErrors) {
  console.log(chalk.red('💥 Validation failed! Please fix the issues above.'));
  // eslint-disable-next-line no-process-exit
  process.exit(1);
} else {
  console.log(chalk.green('🎉 All validation checks passed!'));
}
