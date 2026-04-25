import type { CSSProperties } from "react";
import type {
	EndpointDefinition,
	ExchangeRate,
	HotItem,
	WeatherForecast,
} from "./api";
import type {
	AvatarState,
	ColorTheme,
	SearchProviderId,
	WallpaperState,
} from "./types";

export function defaults(endpoint: EndpointDefinition) {
	return Object.fromEntries(
		(endpoint.params || []).map((param) => [
			param.name,
			param.defaultValue || "",
		]),
	);
}

export function skeletonLines(count: number) {
	return Array.from({ length: count }, (_, index) => `loading-${index}`);
}

export function skeletonItems(count: number): HotItem[] {
	return Array.from({ length: count }, (_, index) => ({
		title: `正在读取第 ${index + 1} 条...`,
	}));
}

export function shortDate(input: string) {
	if (!input) return "";
	const date = new Date(input.replace(/\//g, "-"));
	if (Number.isNaN(date.getTime())) return input.slice(5);
	return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function formatHourlyTime(input?: string) {
	if (!input) return "";
	const date = new Date(input.replace(" ", "T"));
	if (Number.isNaN(date.getTime())) return input.slice(-5);
	return date.toLocaleTimeString("zh-CN", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function getUpcomingForecastDays(
	days?: WeatherForecast["daily_forecast"],
): Array<{
	date: string;
	label: string;
	condition?: string;
	max: string | number;
	min: string | number;
}> {
	if (!days?.length) return [];
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return days
		.map((day) => ({
			date: day.time || day.date || "",
			condition: day.day_weather || day.day_condition,
			max: day.max_degree ?? day.max_temperature ?? "--",
			min: day.min_degree ?? day.min_temperature ?? "--",
		}))
		.filter((day) => {
			const date = new Date(day.date.replace(/\//g, "-"));
			if (Number.isNaN(date.getTime())) return true;
			date.setHours(0, 0, 0, 0);
			return date >= today;
		})
		.slice(0, 7)
		.map((day, index) => ({
			...day,
			label:
				index === 0 ? "今天" : index === 1 ? "明天" : formatWeekLabel(day.date),
		}));
}

export function formatWeekLabel(input: string) {
	const date = new Date(input.replace(/\//g, "-"));
	if (Number.isNaN(date.getTime())) return "本周";
	return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][
		date.getDay()
	];
}

export function weatherIconType(condition?: string) {
	if (!condition) return "cloudy";
	if (condition.includes("雨") || condition.includes("雷")) return "rainy";
	if (condition.includes("晴") && !condition.includes("云")) return "sunny";
	if (condition.includes("雪")) return "snowy";
	return "cloudy";
}

export function getQqAvatarUrl(qq: string) {
	return `https://q1.qlogo.cn/g?b=qq&nk=${encodeURIComponent(qq)}&s=100`;
}

export function getAvatarSrc(avatar: AvatarState) {
	if (avatar.mode === "upload" && avatar.src) return avatar.src;
	if (avatar.mode === "qq" && avatar.qq)
		return avatar.src || getQqAvatarUrl(avatar.qq);
	return "/avatar.jpg";
}

export function buildSearchTarget(provider: SearchProviderId, keyword: string) {
	const query = encodeURIComponent(keyword);
	if (provider === "bing") return `https://www.bing.com/search?q=${query}`;
	if (provider === "google") return `https://www.google.com/search?q=${query}`;
	if (provider === "chatgpt") return `https://chatgpt.com/?q=${query}`;
	if (provider === "doubao") return `https://www.doubao.com/chat/?q=${query}`;
	return "#";
}

export function getWallpaperStyle(
	wallpaper: WallpaperState,
	colorTheme: ColorTheme,
): CSSProperties {
	const dark = colorTheme === "dark";
	if (wallpaper.mode === "custom" && wallpaper.src) {
		return {
			backgroundImage: dark
				? `linear-gradient(180deg, rgba(7, 16, 15, 0.78), rgba(7, 16, 15, 0.9)), url("${wallpaper.src}")`
				: `linear-gradient(180deg, rgba(246, 248, 248, 0.84), rgba(246, 248, 248, 0.9)), url("${wallpaper.src}")`,
			backgroundSize: "cover",
			backgroundPosition: "center",
			backgroundAttachment: "fixed",
		};
	}
	if (wallpaper.mode === "mint") {
		return {
			background:
				dark
					? "linear-gradient(135deg, rgba(55,216,197,0.16), rgba(37,99,235,0.1) 45%, rgba(7,16,15,1) 100%)"
					: "linear-gradient(135deg, rgba(15,155,142,0.16), rgba(37,99,235,0.08) 45%, rgba(246,248,248,1) 100%)",
		};
	}
	if (wallpaper.mode === "paper") {
		return {
			background:
				dark
					? "linear-gradient(180deg, rgba(12,25,23,0.96), rgba(7,16,15,1)), radial-gradient(circle at 20% 18%, rgba(55,216,197,0.12), transparent 28rem)"
					: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(246,248,248,1)), radial-gradient(circle at 20% 18%, rgba(15,155,142,0.06), transparent 28rem)",
		};
	}
	if (wallpaper.mode === "dawn") {
		return {
			background:
				dark
					? "linear-gradient(135deg, rgba(76,43,23,0.55), rgba(13,28,25,1) 52%, rgba(7,16,15,1))"
					: "linear-gradient(135deg, rgba(255,244,229,0.95), rgba(239,247,245,1) 52%, rgba(246,248,248,1))",
		};
	}
	return {};
}

export function readCurrencyRate(data: ExchangeRate | undefined, code: string) {
	if (!data?.rates) return undefined;
	if (Array.isArray(data.rates)) {
		const match = data.rates.find(
			(item) => item.currency === code || item.code === code,
		);
		return Number(match?.rate ?? match?.value) || undefined;
	}
	return data.rates[code];
}
