#!/usr/bin/env node
/**
 * Install a skill from .agents/skills/ into ~/.claude/skills/
 *
 * Skills with "global": true in metadata.json are also injected into
 * ~/.claude/CLAUDE.md so they apply to every project on the machine.
 *
 * Usage:
 *   node scripts/install-skill.mjs <skill-name>
 *   node scripts/install-skill.mjs vinhn-scroll-entrance-animations
 *
 * Lists available skills if no argument given.
 */

import { cpSync, existsSync, mkdirSync, readFileSync, appendFileSync, readdirSync } from 'node:fs';
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

// Global skills: inject @import into ~/.claude/CLAUDE.md
const metaPath = join(src, 'metadata.json');
if (existsSync(metaPath)) {
	const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
	if (meta.global) {
		const claudeMd = join(homedir(), '.claude', 'CLAUDE.md');
		const importLine = `@skills/${skillName}/SKILL.md`;
		const existing = existsSync(claudeMd) ? readFileSync(claudeMd, 'utf8') : '';
		if (existing.includes(importLine)) {
			console.log(`Global: already in ~/.claude/CLAUDE.md — skipped`);
		} else {
			mkdirSync(join(homedir(), '.claude'), { recursive: true });
			appendFileSync(claudeMd, `\n${importLine}\n`);
			console.log(`Global: injected ${importLine} into ~/.claude/CLAUDE.md`);
		}
	}
}
