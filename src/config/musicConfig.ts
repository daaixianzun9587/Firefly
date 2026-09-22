import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import type { MusicPlayerConfig } from "../types/config";

// 音乐播放器配置
export const musicPlayerConfig: MusicPlayerConfig = {
	// 禁用音乐播放器方法：
	// 模板默认侧边栏和导航栏两个都显示
	// 1. 侧边栏：在sidebarConfig.ts侧边栏配置把音乐组件enable设为false禁用即可
	// 2. 导航栏：在本配置文件把showInNavbar设为false禁用即可

	// 是否在导航栏显示音乐播放器入口
	showInNavbar: true,

	// 使用方式："meting" 使用 Meting API，"local" 使用本地音乐列表
	mode: "meting",

	// 默认音量 (0-1)
	volume: 0.7,

	// 播放模式：'list'=列表循环, 'one'=单曲循环, 'random'=随机播放
	playMode: "list",

	// 是否显启用歌词
	showLyrics: true,

	// Meting API 配置
	meting: {
		// Meting API 地址
		// 2026-09-22 实测：原首位 api.i-meto.com 已失效——TCP 可连通但 25 秒以上不返回数据，
		// 会让播放器长时间转圈（现已有超时保护兜底）。故把实测可用、0.2s 返回的接口提到首位，
		// 失效的那个降为备用。如需还原，把下面两行对调即可。
		api: "https://api.injahow.cn/meting/?server=:server&type=:type&id=:id",
		// 音乐平台：netease=网易云音乐, tencent=QQ音乐, kugou=酷狗音乐, xiami=虾米音乐, baidu=百度音乐
		server: "netease",
		// 类型：song=单曲, playlist=歌单, album=专辑, search=搜索, artist=艺术家
		type: "playlist",
		// 歌单/专辑/单曲 ID 或搜索关键词
		id: "10046455237",
		// 认证 token（可选）
		auth: "",
		// 备用 API 配置（当主 API 失败时使用）
		fallbackApis: [
			"https://api.moeyao.cn/meting/?server=:server&type=:type&id=:id",
			"https://api.i-meto.com/meting/api?server=:server&type=:type&id=:id&r=:r",
		],
	},

	// 本地音乐配置（当 mode 为 'local' 时使用）
	// 1. 支持传入歌词文件的路径
	// lrc: "/assets/music/lrc/使一颗心免于哀伤-哼唱.lrc",
	// 2. 或者直接填入歌词字符串内容
	// lrc: "[00:00.00]歌词内容...",
	local: {
		playlist: [
			{
				name: "使一颗心免于哀伤",
				artist: "知更鸟 / HOYO-MiX / Chevy",
				url: "/assets/music/使一颗心免于哀伤-哼唱.mp3",
				cover: "/assets/music/cover/109951169585655912.webp",
				lrc: "",
			},
		],
	},
};

/**
 * 播放器「视图配置」——所有 MusicPlayer 实例用的都是同一份（内容完全由
 * musicConfig + 当前语言决定，与实例无关；实例之间只有 widgetId 不同）。
 *
 * 之所以抽到这里：MusicPlayer 在首页会被渲染多次（侧栏 + 导航栏），
 * 而这份配置序列化后有 ~26KB —— 逐实例注入会白占约 52KB 的内联脚本体积。
 * 现在由单例组件 MusicManager 注入并挂到 window.__fireflyMusicView 上共享。
 */
export function getMusicViewConfig(): Record<string, unknown> {
	return {
		showLyrics: musicPlayerConfig.showLyrics ?? true,
		i18n: {
			noPlaying: i18n(I18nKey.musicNoPlaying),
			lyrics: i18n(I18nKey.musicLyrics),
			noLyrics: i18n(I18nKey.musicNoLyrics),
			loadingLyrics: i18n(I18nKey.musicLoadingLyrics),
			failedLyrics: i18n(I18nKey.musicFailedLyrics),
			noSongs: i18n(I18nKey.musicNoSongs),
			error: i18n(I18nKey.musicError),
			play: i18n(I18nKey.musicPlay),
			pause: i18n(I18nKey.musicPause),
			noCover: i18n(I18nKey.musicNoCover),
			music: i18n(I18nKey.music),
		},
	};
}
