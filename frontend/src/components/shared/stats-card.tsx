import React, { ReactNode } from "react";

interface StatsCardProps {
    label: string;
    count: string | number;
    trend?: string;
    subtext?: string;
    icon: ReactNode;
    trendColor?: "green" | "red" | "orange" | "blue" | "gray";
    className?: string;
}

export const StatsCard = ({
    label,
    count,
    trend,
    subtext,
    icon,
    trendColor = "green",
    className = ""
}: StatsCardProps) => {
    const colorMap = {
        green: "bg-green-50 text-green-600",
        red: "bg-red-50 text-red-600",
        orange: "bg-orange-50 text-orange-600",
        blue: "bg-blue-50 text-blue-600",
        gray: "bg-gray-50 text-gray-400",
    };

    return (
        <div className={`bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all ${className}`}>
            <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                <h4 className="text-4xl font-black text-gray-900">{count}</h4>
                {trend && (
                    <p className={`text-[10px] font-black uppercase flex items-center gap-2 tracking-tighter ${colorMap[trendColor].split(' ')[1]}`}>
                        <span>{trend}</span>
                    </p>
                )}
                {subtext && <p className="text-[10px] font-bold text-gray-300 italic">{subtext}</p>}
            </div>
            <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-500">
                <div className={colorMap[trendColor].split(' ')[1]}>
                    {icon}
                </div>
            </div>
        </div>
    );
};
