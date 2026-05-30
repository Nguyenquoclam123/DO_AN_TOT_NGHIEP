import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const font = Outfit({ subsets: ["latin"] });

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const metadata: Metadata = {
    title: "My Job | AI-Powered Matching System",
    description: "Next-generation Applicant Tracking System with Gemini AI",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={cn(font.className, "min-h-screen antialiased")}>
                <div className="relative flex min-h-screen flex-col">
                    {/* Background Decorative Elements */}
                    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
                        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
                        <div className="absolute top-[20%] -right-[10%] h-[30%] w-[30%] rounded-full bg-blue-500/10 blur-[100px]" />
                    </div>

                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
