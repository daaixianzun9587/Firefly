#!/usr/bin/env node
/**
 * 按需把看板娘静态资源复制进 dist/。
 *
 * 背景：public/pio/ 原本有 14.62 MB（其中单个 wav 7.14 MB、单个 png 5.40 MB），
 * 占发布体积约 30%；而 Spine 与 Live2D 看板娘默认都是关闭的。
 * 只要它还放在 public/ 下，每次构建都会整包进 dist/ 并随部署上传。
 *
 * 因此资源改放到仓库内的 pio-assets/（不再是 public），
 * 由本脚本在 astro build 之后**按 pioConfig 里的开关决定是否复制**到 dist/pio/。
 * URL 路径 /pio/... 保持不变，所以启用时无需改任何配置或代码。
 *
 * 解析失败时的策略：**照常复制**。
 * 宁可多传 14.62 MB，也不能出现「配置开了、模型却找不到」这种静默失效。
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "pio-assets");
const DEST = join(root, "dist", "pio");
const CONFIG = join(root, "src", "config", "pioConfig.ts");
const TAG = "[pio-assets]";

function readEnableFlags() {
	const text = readFileSync(CONFIG, "utf8");
	/** 取某个顶层配置块里出现的第一个 enable 值 */
	const pick = (marker) => {
		const start = text.indexOf(marker);
		if (start < 0) return null;
		const m = text.slice(start).match(/enable\s*:\s*(true|false)/);
		return m ? m[1] === "true" : null;
	};
	return {
		spine: pick("export const spineModelConfig"),
		live2d: pick("export const live2dWidgetConfig"),
	};
}

if (!existsSync(join(root, "dist"))) {
	console.log(`${TAG} 未找到 dist/，跳过（请先执行 astro build）`);
	process.exit(0);
}

if (!existsSync(SRC)) {
	console.warn(`${TAG} 未找到 ${SRC}，跳过`);
	process.exit(0);
}

const flags = readEnableFlags();
const unknown = flags.spine === null || flags.live2d === null;
const enabled = unknown || flags.spine || flags.live2d;

if (unknown) {
	console.warn(
		`${TAG} 无法从 pioConfig.ts 解析出开关（spine=${flags.spine}, live2d=${flags.live2d}），按「已启用」处理：宁愿多传体积，也不能让模型缺失`,
	);
}

if (!enabled) {
	// 关闭时主动清掉可能残留的旧副本，避免出现「已经关了、部署里却还有」
	if (existsSync(DEST)) {
		rmSync(DEST, { recursive: true, force: true });
	}
	console.log(`${TAG} 看板娘已关闭（spine=false, live2d=false）→ 不复制资源，发布体积约 −14.6MB`);
	process.exit(0);
}

mkdirSync(join(root, "dist"), { recursive: true });
cpSync(SRC, DEST, { recursive: true });
console.log(
	`${TAG} 看板娘已启用（spine=${flags.spine}, live2d=${flags.live2d}）→ 已复制 pio-assets/ → dist/pio/`,
);
