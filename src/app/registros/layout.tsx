
"use client";

import { VisitsProvider } from "@/contexts/VisitsContext";

export default function RecordsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <VisitsProvider>{children}</VisitsProvider>;
}
