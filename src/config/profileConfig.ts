import type { ProfileConfig } from "../types/config";

export const profileConfig: ProfileConfig = {
	// 头像
	// 图片路径支持三种格式：
	// 1. public 目录（以 "/" 开头，不优化）："/assets/images/avatar.webp"
	// 2. src 目录（不以 "/" 开头，自动优化但会增加构建时间，推荐）："assets/images/avatar.webp"
	// 3. 远程 URL："https://example.com/avatar.jpg"
	avatar: "assets/images/avatar.avif",

	// 名字
	name: "StarSeeker",

	// 个人签名
	bio: "Hello, I'm StarSeeker.",

	// 链接配置
	// 已经预装的图标集：fa7-brands，fa7-regular，fa7-solid，material-symbols，simple-icons
	// 访问https://icones.js.org/ 获取图标代码，
	// 如果想使用尚未包含相应的图标集，则需要安装它
	// `pnpm add @iconify-json/<icon-set-name>`
	// showName: true 时显示图标和名称，false 时只显示图标
	links: [
		{
			// 站内「欢迎交流」页面（QQ 二维码名片 + 粒子背景），页面文件：src/pages/qq.astro
			name: "qq",
			icon: "fa7-brands:qq",
			url: "/qq/",
			showName: false,
		},
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			url: "https://github.com/daaixianzun9587",
			showName: false,
		},
		{
			// mailto 链接会自动做 base64 防爬虫处理（见 src/components/widget/Profile.astro）
			name: "Email",
			icon: "fa7-solid:envelope",
			url: "mailto:1810004836@qq.com",
			showName: false,
		},
		{
			name: "RSS",
			icon: "fa7-solid:rss",
			url: "/rss/",
			showName: false,
		},
	],
};
