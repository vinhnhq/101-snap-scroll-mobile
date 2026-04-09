export default function Home() {
	return (
		<div
			data-testid="scroll-container"
			className="h-lvh overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
			style={{ WebkitOverflowScrolling: "touch" }}
		>
			{/* Screen 1 — Hero */}
			<section
				data-testid="slide-1"
				className="snap-start snap-always h-lvh w-full flex flex-col justify-end px-6 pt-safe pb-safe-min"
			>
				<span className="text-sm font-semibold uppercase tracking-widest text-violet-300 dark:text-violet-400 mb-3">
					New Season
				</span>
				<h1 className="text-5xl font-black text-white leading-tight mb-4">
					Move
					<br />
					Different.
				</h1>
				<p className="text-violet-200 dark:text-violet-300 text-base leading-relaxed mb-8 max-w-xs">
					Performance gear built for athletes who refuse to slow down.
				</p>
				<button
					type="button"
					className="w-full bg-white text-violet-700 dark:text-violet-900 font-bold text-base py-4 rounded-2xl"
				>
					Shop Now
				</button>
			</section>

			{/* Screen 2 — Featured product */}
			<section
				data-testid="slide-2"
				className="snap-start snap-always h-lvh w-full flex flex-col justify-center px-6 gap-5 pt-safe pb-safe"
			>
				<span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
					Featured Drop
				</span>
				<div className="bg-zinc-800 rounded-3xl h-48 w-full flex items-center justify-center">
					<span className="text-7xl">👟</span>
				</div>
				<div>
					<h2 className="text-2xl font-bold text-white">AirStride Pro</h2>
					<p className="text-zinc-400 text-sm mt-1">Carbon-fiber midsole · Size 6–14</p>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-3xl font-black text-white">$219</span>
					<button
						type="button"
						className="bg-violet-600 text-white font-semibold text-sm px-6 py-3 rounded-xl"
					>
						Add to Bag
					</button>
				</div>
			</section>

			{/* Screen 3 — Stats */}
			<section
				data-testid="slide-3"
				className="snap-start snap-always h-lvh w-full flex flex-col justify-center px-6 gap-6 pt-safe pb-safe"
			>
				<h2 className="text-2xl font-black text-amber-900 dark:text-amber-100">By the numbers.</h2>
				<div className="grid grid-cols-2 gap-4">
					{[
						{ value: "2.4M", label: "Athletes" },
						{ value: "98%", label: "Satisfaction" },
						{ value: "42", label: "Countries" },
						{ value: "12yr", label: "In the game" },
					].map((stat) => (
						<div key={stat.label} className="bg-amber-300 dark:bg-amber-900 rounded-2xl p-4">
							<p className="text-3xl font-black text-amber-900 dark:text-amber-100">{stat.value}</p>
							<p className="text-amber-700 dark:text-amber-400 text-sm font-medium">{stat.label}</p>
						</div>
					))}
				</div>
			</section>

			{/* Screen 4 — Reviews | tall content scrolls inside the fixed 100lvh box */}
			<section
				data-testid="slide-4"
				className="snap-start snap-always h-lvh w-full flex flex-col overflow-y-auto pt-safe pb-safe-min"
			>
				<h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 px-6 mb-4">What they say.</h2>
				<div className="flex flex-col gap-4 px-6 pb-2">
					{[
						{
							name: "Jordan K.",
							stars: 5,
							text: "Best running shoe I've ever owned. My 10k time dropped by 4 minutes.",
							tag: "Runner",
						},
						{
							name: "Mia R.",
							stars: 5,
							text: "Lightweight and responsive. Wore them through a full marathon no problem.",
							tag: "Triathlete",
						},
						{
							name: "Sam T.",
							stars: 4,
							text: "Great build quality and super stylish. The sizing runs slightly large.",
							tag: "Gym",
						},
						{
							name: "Priya N.",
							stars: 5,
							text: "Ordered for cross-training and they exceeded every expectation.",
							tag: "CrossFit",
						},
					].map((r) => (
						<div key={r.name} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm">
							<div className="flex items-center justify-between mb-2">
								<span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{r.name}</span>
								<span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full">
									{r.tag}
								</span>
							</div>
							<p className="text-yellow-400 text-sm mb-2">{"★".repeat(r.stars)}</p>
							<p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{r.text}</p>
						</div>
					))}
				</div>
			</section>

			{/* Screen 5 — CTA / Newsletter */}
			<section
				data-testid="slide-5"
				className="snap-start snap-always h-lvh w-full flex flex-col justify-center px-6 gap-6 pt-safe pb-safe-min"
			>
				<div>
					<span className="text-sm font-semibold uppercase tracking-widest text-rose-200 dark:text-rose-300">
						Stay ahead
					</span>
					<h2 className="text-3xl font-black text-white mt-2 leading-tight">
						Get early
						<br />
						access.
					</h2>
					<p className="text-rose-100 dark:text-rose-200 text-sm mt-3">
						Drop alerts, exclusive offers, no spam.
					</p>
				</div>
				<div className="flex flex-col gap-3">
					<input
						type="email"
						placeholder="your@email.com"
						className="w-full bg-white/20 text-white placeholder-rose-200 text-sm px-4 py-4 rounded-2xl outline-none"
					/>
					<button
						type="button"
						className="w-full bg-white text-rose-600 dark:text-rose-900 font-bold text-base py-4 rounded-2xl"
					>
						Notify Me
					</button>
				</div>
			</section>
		</div>
	);
}
