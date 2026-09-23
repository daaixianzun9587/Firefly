/**
 * 本地存储（localStorage）的安全封装。
 *
 * 为什么需要这一层：
 * localStorage 在下列场景会**直接抛异常**（而不是返回 null）：
 *   - Safari / Firefox 的隐私模式
 *   - 存储配额超限（QuotaExceededError）
 *   - 浏览器设置为禁用 Cookie / 站点数据
 *   - 部分 WebView / 内嵌浏览器
 * 一旦抛出且没被捕获，会中断整段脚本 —— 进而导致主题切换、显示设置等功能整体不可用。
 *
 * 因此所有读写统一走这里：异常被捕获并退化到**内存兜底**，保证功能不中断。
 * 内存兜底仅存活于当前页面会话，这已足够让"设置"这类功能继续可用。
 */

/** 内存兜底：localStorage 不可用或写入失败时使用 */
const memoryStore = new Map<string, string>();

function isLocalStorageAvailable(): boolean {
	try {
		return typeof localStorage !== "undefined" && localStorage !== null;
	} catch {
		// 访问 window.localStorage 本身就可能抛（某些隐私模式）
		return false;
	}
}

export function getStorageItem(key: string): string | null {
	try {
		if (isLocalStorageAvailable()) {
			const value = localStorage.getItem(key);
			if (value !== null) return value;
		}
	} catch {
		// 忽略：退到内存兜底
	}
	return memoryStore.has(key) ? (memoryStore.get(key) as string) : null;
}

export function setStorageItem(key: string, value: string): void {
	try {
		if (isLocalStorageAvailable()) {
			localStorage.setItem(key, value);
			return;
		}
	} catch {
		// 配额超限等情况：退到内存兜底
	}
	memoryStore.set(key, value);
}

export function removeStorageItem(key: string): void {
	try {
		if (isLocalStorageAvailable()) {
			localStorage.removeItem(key);
		}
	} catch {
		// 忽略
	}
	memoryStore.delete(key);
}

/** 读取并 JSON 解析；解析失败或不存在时返回 fallback */
export function getStorageJSON<T>(key: string, fallback: T): T {
	const raw = getStorageItem(key);
	if (raw === null) return fallback;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

/** 写入 JSON；序列化失败时静默忽略 */
export function setStorageJSON(key: string, value: unknown): void {
	try {
		setStorageItem(key, JSON.stringify(value));
	} catch {
		// 忽略
	}
}
