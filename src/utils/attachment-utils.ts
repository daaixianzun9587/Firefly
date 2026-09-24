import { statSync } from "node:fs";
import path from "node:path";
import { url } from "./url-utils";

/**
 * 文章附件（下载）解析工具。
 *
 * 设计要点：
 * - 文件大小**在构建期用 node:fs 读取**，frontmatter 里永远不手写 size（避免写错/过期）；
 * - 外链（http/https）不读取大小，显示 "—"；
 * - **本地文件缺失直接抛错**，让构建失败 —— 坏下载链接是真实缺陷，
 *   宁可 CI 阶段发现，也不要静默上线；
 * - URL 一律走 url-utils 的 url()，由它处理 BASE_URL。
 */

export interface AttachmentItem {
	/** 显示名（frontmatter 未给 name 时用文件名） */
	name: string;
	/** 最终 href */
	url: string;
	/** 字节数；外链时为 null */
	size: number | null;
	/** 格式化后的体积文本，如 "1.2 MB" / "—" */
	sizeText: string;
	/** 小写扩展名，如 "zip" / "pdf" / "html" */
	ext: string;
	isExternal: boolean;
}

function isExternalPath(p: string): boolean {
	return /^https?:\/\//i.test(p) || p.startsWith("//");
}

export function formatFileSize(bytes: number | null): string {
	if (bytes === null || !Number.isFinite(bytes) || bytes < 0) return "—";
	if (bytes < 1024) return `${bytes} B`;
	const kb = bytes / 1024;
	if (kb < 1024) return `${kb.toFixed(1)} KB`;
	return `${(kb / 1024).toFixed(1)} MB`;
}

function getExt(p: string): string {
	const clean = p.split(/[?#]/)[0];
	const m = /\.([a-zA-Z0-9]+)$/.exec(clean);
	return m ? m[1].toLowerCase() : "";
}

function baseName(p: string): string {
	const clean = decodeURIComponent(p.split(/[?#]/)[0]);
	const seg =
		clean.replace(/\\/g, "/").split("/").filter(Boolean).pop() || clean;
	return seg.replace(/\.[a-zA-Z0-9]+$/, "");
}

export function resolveAttachments(
	raw: unknown,
	publicDir: string,
	slug: string,
): AttachmentItem[] {
	if (!Array.isArray(raw)) return [];

	const items: AttachmentItem[] = [];
	for (const entry of raw) {
		if (!entry || typeof entry !== "object") continue;
		const p = String((entry as { path?: unknown }).path ?? "").trim();
		if (!p) continue;
		const nameRaw = String((entry as { name?: unknown }).name ?? "").trim();
		const external = isExternalPath(p);

		let size: number | null = null;
		if (!external) {
			const rel = decodeURIComponent(p.replace(/^\/+/, ""));
			const abs = path.join(publicDir, rel);
			try {
				size = statSync(abs).size;
			} catch {
				throw new Error(
					`[attachments] 文章 "${slug}" 声明的附件在磁盘上找不到：${p}\n` +
						`  期望位置：${abs}\n` +
						"  请把文件放到 public/ 下对应位置，或改用 http(s):// 外链。",
				);
			}
		}

		items.push({
			name: nameRaw || baseName(p),
			url: external ? p : url(`/${p.replace(/^\/+/, "")}`),
			size,
			sizeText: formatFileSize(size),
			ext: getExt(p),
			isExternal: external,
		});
	}
	return items;
}
