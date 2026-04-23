import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Snap Scroll",
		short_name: "SnapScroll",
		description: "Snap scroll mobile experience",
		start_url: "/",
		display: "standalone",
		orientation: "portrait",
		background_color: "#7c3aed",
		theme_color: "#7c3aed",
		icons: [
			{
				src: "/icon.svg",
				sizes: "any",
				type: "image/svg+xml",
				purpose: "maskable",
			},
		],
	};
}
