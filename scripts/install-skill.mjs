#!/usr/bin/env node
/**
 * Install a skill from .agents/skills/ into ~/.claude/skills/
 *
 * Usage:
 *   node scripts/install-skill.mjs <skill-name>
 *   node scripts/install-skill.mjs scroll-entrance-animations
 *
 * Lists available skills if no argument given.
 */

import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const projectRoot = new URL('..', import.meta.url).pathname;
const skillsSource = join(projectRoot, '.agents', 'skills');
const skillsDest = join(homedir(), '.claude', 'skills');

const skillName = process.argv[2];

if (!skillName) {
	const available = readdirSync(skillsSource, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name);
	console.log('Available skills:');
	for (const name of available) console.log(`  ${name}`);
	console.log('\nUsage: node scripts/install-skill.mjs <skill-name>');
	process.exit(0);
}

const src = join(skillsSource, skillName);
const dest = join(skillsDest, skillName);

if (!existsSync(src)) {
	console.error(`Skill not found: ${skillName}`);
	console.error(`Run without arguments to list available skills.`);
	process.exit(1);
}

mkdirSync(skillsDest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log(`Installed: ${skillName} → ${dest}`);
