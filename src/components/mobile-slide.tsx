interface MobileSlideProps {
	children: React.ReactNode;
	className?: string;
	"data-testid"?: string;
}

export function MobileSlide({
	children,
	className,
	"data-testid": testId,
}: MobileSlideProps) {
	return (
		<section
			data-testid={testId}
			className={`snap-start snap-always h-lvh w-full flex flex-col pt-safe pb-safe-min ${className ?? ""}`}
		>
			{children}
		</section>
	);
}
