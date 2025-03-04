"use client";

import { useState } from "react";
import { CopyButtonProps } from "../types";

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(textToCopy);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	return (
		<button
			onClick={handleCopy}
			className={`
        px-2 py-1 text-xs rounded transition-colors
        ${
					copied
						? "bg-success-light dark:bg-success-dark text-white"
						: "bg-gray-700 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-200"
				}
      `}
			aria-label="Copy to clipboard"
		>
			{copied ? "Copied!" : "Copy"}
		</button>
	);
};

export default CopyButton;
