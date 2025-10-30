"use client";

import { useVisitsContext } from "@/hooks/use-visits-context";
import { useEffect } from "react";

export default function RecordsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { fetchVisits } = useVisitsContext();

    useEffect(() => {
        fetchVisits();
    }, [fetchVisits]);

    return <>{children}</>;
}
