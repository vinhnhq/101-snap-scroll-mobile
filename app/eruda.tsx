"use client";

import { useEffect } from "react";

export function Eruda() {
	useEffect(() => {
		const script = document.createElement("script");
		script.src = "//cdn.jsdelivr.net/npm/eruda";
		script.onload = () => {
			// @ts-ignore
			window.eruda?.init();
		};
		document.body.appendChild(script);
		return () => script.remove();
	}, []);
	return null;
}
