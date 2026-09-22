#!/usr/bin/env node
/**
 * 分阶段计时执行构建，用于量化各阶段耗时。
 *
 * 为什么单独放一个脚本：默认的 `build` 脚本（CI 使用）保持原样不动，
 * 避免为"测量"而给构建链路增加失败面。需要基线数据时手动跑：
 *
 *   pnpm build:timed
 *
 * 输出示例：
 *   [timing] generate-icons   1.4s
 *   [timing] generate-lqips   3.1s
 *   [timing] astro build     52.3s
 *   [timing] pagefind         0.8s
 *   [timing] TOTAL           57.6s
 */
import { spawnSync } from "node:child_process";

const STAGES = [
	["generate-icons", "node scripts/generate-icons.js"],
	["generate-lqips", "pnpm exec tsx scripts/generate-lqips.ts"],
	["astro build", "astro build"],
	["pagefind", "pagefind --site dist"],
];

const pad = (s) => s.padEnd(16);
let total = 0;

for (const [label, cmd] of STAGES) {
	const startedAt = Date.now();
	const result = spawnSync(cmd, { shell: true, stdio: "inherit" });
	const seconds = (Date.now() - startedAt) / 1000;
	total += seconds;

	console.log(`[timing] ${pad(label)} ${seconds.toFixed(1)}s`);

	if (result.status !== 0) {
		console.error(`[timing] 阶段失败：${label}（exit ${result.status ?? "null"}）`);
		process.exit(result.status ?? 1);
	}
}

console.log(`[timing] ${pad("TOTAL")} ${total.toFixed(1)}s`);
