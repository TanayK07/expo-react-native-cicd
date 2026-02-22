// app/components/MermaidDiagram.tsx
"use client";

import React, { useEffect, useState } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
  chart,
  className = "",
}) => {
  const [svg, setSvg] = useState<string>("");
  const uniqueId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        // Initialize mermaid with minimalistic configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: document.documentElement.classList.contains("dark")
            ? "dark"
            : "default",
          securityLevel: "loose",
          logLevel: "error",
          themeVariables: {
            primaryColor: "#EBF5FF",
            primaryTextColor: "#1E40AF",
            primaryBorderColor: "#3B82F6",
            lineColor: "#93C5FD",
            fontSize: "14px",
            fontFamily: "Inter, system-ui, sans-serif",
            nodeBorder: "1px",
            edgeLabelBackground: "#ffffff",
          },
          flowchart: {
            htmlLabels: true,
            curve: "linear", // Use straight lines for a cleaner look
            diagramPadding: 8,
          },
        });

        // Render the diagram
        const { svg } = await mermaid.render(uniqueId, chart);
        setSvg(svg);
      } catch (error: any) {
        console.error("Mermaid rendering error:", error);
        setSvg(
          `<div class="text-red-500 p-4">Error rendering diagram: ${error.message || "Unknown error"}</div>`,
        );
      }
    };

    renderDiagram();
  }, [chart, uniqueId]);

  return (
    <div
      className={`mermaid-diagram ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        maxWidth: "100%",
        margin: "0 auto",
        transform: "scale(0.85)",
        transformOrigin: "center center",
      }}
    />
  );
};

export default MermaidDiagram;
