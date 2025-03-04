"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

interface ThemeProviderProps {
	children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
	return (
		<NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
			{children}
		</NextThemesProvider>
	);
}
