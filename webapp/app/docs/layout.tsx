import { Suspense } from "react";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="docs-layout">
      <Suspense fallback={<div>Loading docs...</div>}>{children}</Suspense>
    </div>
  );
}
