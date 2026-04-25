import {
	CalendarClock,
	CircleDollarSign,
	Cloud,
	CloudSun,
	Code2,
	Coins,
	ExternalLink,
	Film,
	Flame,
	Fuel,
	Gauge,
	Github,
	Globe2,
	LayoutGrid,
	QrCode,
	RefreshCw,
	Search,
	ShieldCheck,
	WalletCards,
} from "lucide-react";
import {
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	buildUrl,
	type DailyNews,
	DEFAULT_API_BASE,
	type EndpointDefinition,
	type EpicGame,
	type ExchangeRate,
	endpoints,
	type FuelPrice,
	formatHotValue,
	type GoldPrice,
	type HotItem,
	toItems,
	type WeatherForecast,
	type WeatherRealtime,
} from "./api";
import { getHomeCards, type HomeCardId } from "./cards";
import { EndpointLab } from "./components/EndpointLab";
import { Header } from "./components/Header";
import { HotBoard, HotPage } from "./components/Hot";
import { DailyCard, NewsPage } from "./components/News";
import { SettingsPanel } from "./components/SettingsPanel";
import { ToolWorkspace } from "./components/ToolWorkspace";
import { WeatherCard, WeatherPage } from "./components/Weather";
import {
	CardTitle,
	EmptyState,
	Footer,
	Metric,
	Status,
	WeatherIcon,
} from "./components/ui";
import {
	API_REPO_URL,
	categoryLabels,
	EPIC_COVER_PLACEHOLDER,
	hotTabs,
	searchProviders,
	STORAGE_KEYS,
	toolDefinitions,
	WEB_REPO_URL,
} from "./config";
import { useApi } from "./hooks/useApi";
import {
	readStoredJson,
	readStoredValue,
	writeStoredJson,
	writeStoredValue,
} from "./storage";
import type {
	ApiState,
	AvatarState,
	ChromeTheme,
	ColorTheme,
	PageId,
	SearchProviderId,
	SettingsState,
	ToolId,
	WallpaperState,
} from "./types";
import {
	buildSearchTarget,
	defaults,
	getWallpaperStyle,
	readCurrencyRate,
	skeletonItems,
	skeletonLines,
} from "./utils";

export function App() {
	const [apiBase, setApiBase] = useState(() =>
		readStoredValue(STORAGE_KEYS.apiBase, DEFAULT_API_BASE),
	);
	const [city, setCity] = useState(() =>
		readStoredValue(STORAGE_KEYS.city, "上海"),
	);
	const [query, setQuery] = useState("");
	const [activePage, setActivePage] = useState<PageId>("home");
	const [activeTool, setActiveTool] = useState<ToolId>("translate");
	const [searchProvider, setSearchProvider] = useState<SearchProviderId>(
		() =>
			readStoredValue(STORAGE_KEYS.searchProvider, "site") as SearchProviderId,
	);
	const [chromeTheme, setChromeTheme] = useState<ChromeTheme>(
		() => readStoredValue(STORAGE_KEYS.chromeTheme, "minimal") as ChromeTheme,
	);
	const [colorTheme, setColorTheme] = useState<ColorTheme>(
		() => readStoredValue(STORAGE_KEYS.colorTheme, "light") as ColorTheme,
	);
	const [hotTab, setHotTab] = useState(hotTabs[1]);
	const [avatar, setAvatar] = useState<AvatarState>(() =>
		readStoredJson(STORAGE_KEYS.avatar, { mode: "default" }),
	);
	const [wallpaper, setWallpaper] = useState<WallpaperState>(() =>
		readStoredJson(STORAGE_KEYS.wallpaper, { mode: "default" }),
	);
	const [settings, setSettings] = useState<SettingsState>(() =>
		readStoredJson(STORAGE_KEYS.settings, {
			showWeather: true,
			showHot: true,
			showNews: true,
			autoRefresh: true,
		}),
	);

	const daily = useApi<DailyNews>(
		apiBase,
		"/60s",
		{},
		settings.showNews,
		settings.autoRefresh,
	);
	const weather = useApi<WeatherRealtime>(
		apiBase,
		"/weather/realtime",
		{ query: city },
		settings.showWeather,
		settings.autoRefresh,
	);
	const forecast = useApi<WeatherForecast>(
		apiBase,
		"/weather/forecast",
		{ query: city, days: "7" },
		settings.showWeather,
		settings.autoRefresh,
	);
	const hot = useApi<unknown>(
		apiBase,
		hotTab.path,
		{},
		settings.showHot,
		settings.autoRefresh,
	);
	const gold = useApi<GoldPrice>(
		apiBase,
		"/gold-price",
		{},
		true,
		settings.autoRefresh,
	);
	const fuel = useApi<FuelPrice>(
		apiBase,
		"/fuel-price",
		{ region: city },
		true,
		settings.autoRefresh,
	);
	const exchange = useApi<ExchangeRate>(
		apiBase,
		"/exchange-rate",
		{ currency: "CNY" },
		true,
		settings.autoRefresh,
	);
	const epic = useApi<EpicGame[]>(
		apiBase,
		"/epic",
		{},
		true,
		settings.autoRefresh,
	);
	const maoyan = useApi<unknown>(
		apiBase,
		"/maoyan/realtime/movie",
		{},
		true,
		settings.autoRefresh,
	);
	const hitokoto = useApi<unknown>(
		apiBase,
		"/hitokoto",
		{},
		true,
		settings.autoRefresh,
	);

	const hotItems = useMemo(() => toItems(hot.data).slice(0, 10), [hot.data]);
	const movieItems = useMemo(
		() => toItems(maoyan.data).slice(0, 4),
		[maoyan.data],
	);

	const searchMatches = useMemo(() => {
		const keyword = query.trim().toLowerCase();
		if (!keyword) return [];
		return endpoints
			.filter((endpoint) =>
				[
					endpoint.name,
					endpoint.path,
					endpoint.description,
					categoryLabels[endpoint.category],
				]
					.join(" ")
					.toLowerCase()
					.includes(keyword),
			)
			.slice(0, 8);
	}, [query]);

	useEffect(() => {
		writeStoredValue(STORAGE_KEYS.apiBase, apiBase);
	}, [apiBase]);

	useEffect(() => {
		writeStoredValue(STORAGE_KEYS.city, city);
	}, [city]);

	useEffect(() => {
		writeStoredJson(STORAGE_KEYS.settings, settings);
	}, [settings]);

	useEffect(() => {
		writeStoredJson(STORAGE_KEYS.avatar, avatar);
	}, [avatar]);

	useEffect(() => {
		writeStoredValue(STORAGE_KEYS.searchProvider, searchProvider);
	}, [searchProvider]);

	useEffect(() => {
		writeStoredValue(STORAGE_KEYS.chromeTheme, chromeTheme);
	}, [chromeTheme]);

	useEffect(() => {
		writeStoredValue(STORAGE_KEYS.colorTheme, colorTheme);
	}, [colorTheme]);

	useEffect(() => {
		const themeColor = colorTheme === "dark" ? "#07100f" : "#ffffff";
		let meta = document.querySelector<HTMLMetaElement>(
			'meta[name="theme-color"]',
		);
		if (!meta) {
			meta = document.createElement("meta");
			meta.name = "theme-color";
			document.head.appendChild(meta);
		}
		meta.content = themeColor;
	}, [colorTheme]);

	useEffect(() => {
		writeStoredJson(STORAGE_KEYS.wallpaper, wallpaper);
	}, [wallpaper]);

	const reloadAll = () => {
		daily.reload();
		weather.reload();
		forecast.reload();
		hot.reload();
		gold.reload();
		fuel.reload();
		exchange.reload();
		epic.reload();
		maoyan.reload();
		hitokoto.reload();
	};

	const runSearch = () => {
		const keyword = query.trim();
		if (!keyword) {
			setActivePage("home");
			return;
		}
		if (searchProvider === "site") {
			setActivePage("tools");
			return;
		}
		window.open(
			buildSearchTarget(searchProvider, keyword),
			"_blank",
			"noopener,noreferrer",
		);
	};

	return (
		<div
			className={`app-shell chrome-${chromeTheme} theme-${colorTheme}`}
			style={getWallpaperStyle(wallpaper, colorTheme)}
		>
			<Header
				activePage={activePage}
				setActivePage={setActivePage}
				avatar={avatar}
				setAvatar={setAvatar}
				colorTheme={colorTheme}
				setColorTheme={setColorTheme}
			/>

			<main>
				<section className="search-band">
					<form
						className="search-box"
						onSubmit={(event) => {
							event.preventDefault();
							runSearch();
						}}
					>
						<Search size={24} />
						<input
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder={
								searchProvider === "site"
									? "搜索接口名称、分类、路径或功能关键词..."
									: `输入关键词，用 ${searchProviders.find((item) => item.id === searchProvider)?.label} 搜索...`
							}
						/>
						<button type="submit">搜索</button>
					</form>
					<div className="search-providers" aria-label="搜索目的地">
						{searchProviders.map((provider) => (
							<button
								key={provider.id}
								type="button"
								className={searchProvider === provider.id ? "active" : ""}
								onClick={() => setSearchProvider(provider.id)}
							>
								<b>{provider.label}</b>
								<small>{provider.sub}</small>
							</button>
						))}
					</div>
					<div className="quick-chips" aria-label="快捷入口">
						<button onClick={() => setActivePage("news")}>
							<CalendarClock size={17} /> 今日60秒
						</button>
						<button
							onClick={() => {
								setHotTab(hotTabs[0]);
								setActivePage("hot");
							}}
						>
							<Flame size={17} /> 微博热搜
						</button>
						<button
							onClick={() => {
								setHotTab(hotTabs[1]);
								setActivePage("hot");
							}}
						>
							<span className="chip-symbol">知</span> 知乎热榜
						</button>
						<button
							onClick={() => {
								setHotTab(hotTabs[2]);
								setActivePage("hot");
							}}
						>
							<span className="chip-symbol pink">B</span> B站热榜
						</button>
						<button onClick={() => setActivePage("weather")}>
							<CloudSun size={17} /> 天气
						</button>
						<button onClick={() => setActivePage("tools")}>
							<Coins size={17} /> 金价
						</button>
						<button onClick={() => setActivePage("tools")}>
							<QrCode size={17} /> 工具
						</button>
					</div>
					{searchMatches.length > 0 && (
						<SearchResults base={apiBase} matches={searchMatches} />
					)}
				</section>

				{activePage === "home" && (
					<HomePage
						settings={settings}
						daily={daily}
						weather={weather}
						forecast={forecast}
						city={city}
						setCity={setCity}
						gold={gold}
						fuel={fuel}
						exchange={exchange}
						hotTab={hotTab}
						setHotTab={setHotTab}
						hot={hot}
						hotItems={hotItems}
						epic={epic}
						movieItems={movieItems}
						hitokoto={hitokoto.data}
						apiBase={apiBase}
						setApiBase={setApiBase}
						setActivePage={setActivePage}
						setActiveTool={setActiveTool}
						setSettings={setSettings}
						reloadAll={reloadAll}
					/>
				)}
				{activePage === "hot" && (
					<HotPage apiBase={apiBase} />
				)}
				{activePage === "news" && <NewsPage apiBase={apiBase} daily={daily} />}
				{activePage === "weather" && (
					<WeatherPage
						city={city}
						setCity={setCity}
						realtime={weather}
						forecast={forecast}
					/>
				)}
				{activePage === "tools" && (
					<ToolsPage
						apiBase={apiBase}
						query={query}
						gold={gold}
						fuel={fuel}
						exchange={exchange}
						city={city}
						activeTool={activeTool}
						setActiveTool={setActiveTool}
					/>
				)}
				{activePage === "settings" && (
					<section className="page-stack">
						<SettingsPanel
							apiBase={apiBase}
							setApiBase={setApiBase}
							city={city}
							setCity={setCity}
							settings={settings}
							setSettings={setSettings}
							reloadAll={reloadAll}
							wallpaper={wallpaper}
							setWallpaper={setWallpaper}
							chromeTheme={chromeTheme}
							setChromeTheme={setChromeTheme}
							colorTheme={colorTheme}
							setColorTheme={setColorTheme}
						/>
					</section>
				)}
			</main>

			<Footer apiBase={apiBase} updatedAt={daily.updatedAt} />
		</div>
	);
}

function HomePage({
	settings,
	daily,
	weather,
	forecast,
	city,
	setCity,
	gold,
	fuel,
	exchange,
	hotTab,
	setHotTab,
	hot,
	hotItems,
	epic,
	movieItems,
	hitokoto,
	apiBase,
	setApiBase,
	setActivePage,
	setActiveTool,
	setSettings,
	reloadAll,
}: {
	settings: SettingsState;
	daily: ApiState<DailyNews> & { reload: () => void };
	weather: ApiState<WeatherRealtime> & { reload: () => void };
	forecast: ApiState<WeatherForecast> & { reload: () => void };
	city: string;
	setCity: (city: string) => void;
	gold: ApiState<GoldPrice> & { reload: () => void };
	fuel: ApiState<FuelPrice> & { reload: () => void };
	exchange: ApiState<ExchangeRate> & { reload: () => void };
	hotTab: (typeof hotTabs)[number];
	setHotTab: (tab: (typeof hotTabs)[number]) => void;
	hot: ApiState<unknown> & { reload: () => void };
	hotItems: HotItem[];
	epic: ApiState<EpicGame[]>;
	movieItems: HotItem[];
	hitokoto?: unknown;
	apiBase: string;
	setApiBase: (value: string) => void;
	setActivePage: (page: PageId) => void;
	setActiveTool: (tool: ToolId) => void;
	setSettings: (value: SettingsState) => void;
	reloadAll: () => void;
}) {
	const renderHomeCard = (cardId: HomeCardId) => {
		if (cardId === "daily") return <DailyCard state={daily} />;
		if (cardId === "hot") {
			return (
				<HotBoard
					tabs={hotTabs}
					active={hotTab.id}
					setActive={setHotTab}
					state={hot}
					items={hotItems}
				/>
			);
		}
		if (cardId === "settings") {
			return (
				<SettingsPanel
					apiBase={apiBase}
					setApiBase={setApiBase}
					settings={settings}
					setSettings={setSettings}
					reloadAll={reloadAll}
					compact
				/>
			);
		}
		if (cardId === "weather") {
			return (
				<WeatherCard
					city={city}
					setCity={setCity}
					realtime={weather}
					forecast={forecast}
					compact
				/>
			);
		}
		if (cardId === "market") {
			return <MarketStrip gold={gold} fuel={fuel} exchange={exchange} city={city} />;
		}
		if (cardId === "entertainmentTools") {
			return (
				<div className="home-right-split">
					<EntertainmentCard epic={epic} movies={movieItems} />
					<ToolShortcuts
						apiBase={apiBase}
						setActivePage={setActivePage}
						setActiveTool={setActiveTool}
					/>
				</div>
			);
		}
		return <QuoteCard data={hitokoto} />;
	};

	return (
		<section className="home-layout">
			<div className="home-left">
				{getHomeCards("left", settings).map((card) => (
					<div className="home-card-slot" key={card.id}>
						{renderHomeCard(card.id)}
					</div>
				))}
			</div>
			<div className="home-right">
				{getHomeCards("right", settings).map((card) => (
					<div className="home-card-slot" key={card.id}>
						{renderHomeCard(card.id)}
					</div>
				))}
			</div>
		</section>
	);
}

function SearchResults({
	base,
	matches,
}: {
	base: string;
	matches: EndpointDefinition[];
}) {
	return (
		<div className="search-results">
			{matches.map((endpoint) => (
				<a
					key={endpoint.id}
					href={buildUrl(base, endpoint.path, defaults(endpoint))}
					target="_blank"
					rel="noreferrer"
				>
					<span>{endpoint.name}</span>
					<small>{endpoint.path}</small>
				</a>
			))}
		</div>
	);
}

function ToolsPage({
	apiBase,
	query,
	gold,
	fuel,
	exchange,
	city,
	activeTool,
	setActiveTool,
}: {
	apiBase: string;
	query: string;
	gold: ApiState<GoldPrice> & { reload: () => void };
	fuel: ApiState<FuelPrice> & { reload: () => void };
	exchange: ApiState<ExchangeRate> & { reload: () => void };
	city: string;
	activeTool: ToolId;
	setActiveTool: (tool: ToolId) => void;
}) {
	return (
		<section className="page-stack">
			<div className="page-title">
				<span>
					<LayoutGrid size={24} /> 工具中心
				</span>
				<small>实用数据置顶，四个便捷工具平铺展示</small>
			</div>
			<MarketStrip gold={gold} fuel={fuel} exchange={exchange} city={city} />
			<ToolWorkspace apiBase={apiBase} activeTool={activeTool} />
			{query.trim() && (
				<div className="card tool-query-tip">
					<CardTitle
						icon={<Search size={18} />}
						title="搜索提示"
						right={<span className="status">已筛选接口实验室</span>}
					/>
					<p>
						你当前搜索的是接口或功能关键词，下方接口实验室会同步筛选匹配项。
					</p>
				</div>
			)}
			<EndpointLab apiBase={apiBase} query={query} />
		</section>
	);
}

function MarketStrip({
	gold,
	fuel,
	exchange,
	city,
}: {
	gold: ApiState<GoldPrice> & { reload: () => void };
	fuel: ApiState<FuelPrice> & { reload: () => void };
	exchange: ApiState<ExchangeRate> & { reload: () => void };
	city: string;
}) {
	const metal = gold.data?.metals?.[0];
	const fuelValue =
		fuel.data?.items?.find((item) => item.name.includes("92"))?.price ||
		fuel.data?.oil92 ||
		fuel.data?.price?.["92"] ||
		fuel.data?.price?.["92#"] ||
		"--";
	const usdRate = readCurrencyRate(exchange.data, "USD");
	const usd = usdRate ? (1 / usdRate).toFixed(4) : "--";

	return (
		<article className="card market-strip">
			<CardTitle icon={<Gauge size={18} />} title="实用数据" />
			<div className="market-grid">
				<Metric
					icon={<Coins size={31} />}
					label="金价"
					value={metal ? `${metal.today_price}` : "--"}
					sub={metal?.unit || "元/克"}
					tone="gold"
				/>
				<Metric
					icon={<Fuel size={31} />}
					label={`${city} 92# 油价`}
					value={fuelValue}
					sub="元/升"
				/>
				<Metric
					icon={<CircleDollarSign size={31} />}
					label="美元/人民币"
					value={String(usd).slice(0, 7)}
					sub="实时汇率"
					tone="red"
				/>
				<Metric
					icon={<CalendarClock size={31} />}
					label="自动刷新"
					value="10 分钟"
					sub="手动刷新可跳过缓存"
				/>
			</div>
		</article>
	);
}

function EntertainmentCard({
	epic,
	movies,
}: {
	epic: ApiState<EpicGame[]>;
	movies: HotItem[];
}) {
	const games = epic.data?.slice(0, 2) ?? [];
	return (
		<article className="card entertainment">
			<CardTitle icon={<Film size={21} />} title="影视与娱乐" />
			<div className="mini-section">
				<div className="mini-heading">
					<b>电影票房</b>
					<small>实时</small>
				</div>
				{movies.length === 0 && <p className="muted">正在读取票房...</p>}
				{movies.map((movie, index) => (
					<div
						className="compact-row"
						key={`${movie.title || movie.name || movie.movie_name}-${index}`}
					>
						<span>{index + 1}</span>
						<b>{movie.title || movie.name || movie.movie_name}</b>
						<small>
							{movie.box_office_desc ||
								formatHotValue(movie.hot_value ?? movie.score ?? movie.heat)}
						</small>
					</div>
				))}
			</div>
			<div className="mini-section game-list">
				<div className="mini-heading">
					<b>Epic 本周免费游戏</b>
					<small>每周</small>
				</div>
				{games.map((game) => (
					<a
						className="game-row"
						key={game.id}
						href={game.link}
						target="_blank"
						rel="noreferrer"
					>
						<img
							src={game.cover || EPIC_COVER_PLACEHOLDER}
							alt=""
							onError={(event) => {
								event.currentTarget.src = EPIC_COVER_PLACEHOLDER;
							}}
						/>
						<span>
							<b>{game.title}</b>
							<small>
								{game.is_free_now
									? "限时免费领取"
									: game.original_price_desc || "即将免费"}
							</small>
						</span>
					</a>
				))}
			</div>
		</article>
	);
}

function ToolShortcuts({
	apiBase,
	setActivePage,
	setActiveTool,
}: {
	apiBase: string;
	setActivePage?: (page: PageId) => void;
	setActiveTool?: (tool: ToolId) => void;
}) {
	return (
		<article className="card tool-card">
			<CardTitle icon={<ShieldCheck size={21} />} title="便捷工具" />
			<div className="tool-grid">
				{toolDefinitions.map((tool) => {
					const Icon = tool.icon;
					const hrefMap: Record<ToolId, string> = {
						translate: buildUrl(apiBase, "/fanyi", {
							text: "你好，世界",
							from: "auto",
							to: "en",
						}),
						qrcode: buildUrl(apiBase, "/qrcode", {
							text: API_REPO_URL,
							encoding: "json",
						}),
						password: buildUrl(apiBase, "/password", {
							length: "18",
							symbols: "true",
						}),
						palette: buildUrl(apiBase, "/color/palette", { color: "#0f9b8e" }),
					};

					return setActivePage && setActiveTool ? (
						<button
							key={tool.id}
							type="button"
							aria-label={`打开工具页：${tool.label}`}
							onClick={() => {
								setActiveTool(tool.id);
								setActivePage("tools");
							}}
						>
							<Icon size={24} />
							<span>
								<b>{tool.label}</b>
								<small>{tool.sub}</small>
							</span>
						</button>
					) : (
						<a
							key={tool.id}
							href={hrefMap[tool.id]}
							target="_blank"
							rel="noreferrer"
						>
							<Icon size={24} />
							<span>
								<b>{tool.label}</b>
								<small>{tool.sub}</small>
							</span>
						</a>
					);
				})}
			</div>
			<div className="tool-card-extra">
				<div>
					<b>接口实验室</b>
					<small>按关键词筛选并直接运行 60s API</small>
				</div>
				{setActivePage ? (
					<button type="button" onClick={() => setActivePage("tools")}>
						<Code2 size={16} /> 打开
					</button>
				) : (
					<a href={WEB_REPO_URL} target="_blank" rel="noreferrer">
						<Github size={16} /> GitHub
					</a>
				)}
			</div>
		</article>
	);
}

function QuoteCard({ data }: { data?: unknown }) {
	const text =
		typeof data === "string"
			? data
			: data && typeof data === "object"
				? String(
						(data as Record<string, unknown>).hitokoto ||
							(data as Record<string, unknown>).text ||
							"生活不是等待风暴过去，而是学会在雨中翩翩起舞。",
					)
				: "生活不是等待风暴过去，而是学会在雨中翩翩起舞。";

	return (
		<article className="quote-card">
			<span>“</span>
			<p>{text}</p>
			<small>60s API 随机一言</small>
		</article>
	);
}
