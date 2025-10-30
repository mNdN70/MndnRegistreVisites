"use client";

import { VisitsContext } from "@/contexts/VisitsContext";
import { useContext, useEffect } from "react";

export default function RecordsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const context = useContext(VisitsContext);

    if (!context) {
        throw new Error("useVisits must be used within a VisitsProvider");
    }
    
    const { fetchVisits } = context;

    useEffect(() => {
        fetchVisits();
    }, [fetchVisits]);

    return <>{children}</>;
}
