'use client';

import { redirect, useRouter } from "next/navigation";
export default function ResourceCalendar() {
    const router = useRouter();
    router.push("/landing");
}