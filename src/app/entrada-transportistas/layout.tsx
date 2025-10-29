
"use client";

import { VisitsProvider } from "@/contexts/VisitsContext";
import { ConfigProvider } from "@/contexts/ConfigContext";

export default function FormsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ConfigProvider>
            <VisitsProvider>{children}</VisitsProvider>
        </ConfigProvider>
    );
}
