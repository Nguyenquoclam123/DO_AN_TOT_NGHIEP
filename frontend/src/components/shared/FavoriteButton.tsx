"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { jobFavoriteService } from "@/services/jobFavorite.service";
import { ConfirmModal } from "./ConfirmModal";

interface FavoriteButtonProps {
    jobId: string;
    initialIsFavorite?: boolean;
    onToggle?: (isFavorite: boolean) => void;
}

export const FavoriteButton = ({ jobId, initialIsFavorite = false, onToggle }: FavoriteButtonProps) => {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // If initialIsFavorite is not provided, check it
        if (initialIsFavorite === undefined) {
            checkStatus();
        }
    }, [jobId]);

    const checkStatus = async () => {
        try {
            const { isFavorite } = await jobFavoriteService.checkFavorite(jobId);
            setIsFavorite(isFavorite);
        } catch (error) {
            console.error("Failed to check favorite status:", error);
        }
    };

    const handleToggleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (loading) return;
        setShowConfirm(true);
    };

    const handleConfirm = async (categoryId?: string) => {
        console.log("Confirming favorite toggle for jobId:", jobId, "category:", categoryId);
        setShowConfirm(false);
        try {
            setLoading(true);
            const res = await jobFavoriteService.toggleFavorite(jobId, categoryId);
            console.log("Toggle favorite response:", res);
            const newStatus = res.isFavorite;
            setIsFavorite(newStatus);
            if (onToggle) onToggle(newStatus);
            
            if (newStatus) {
                router.push(`/candidate/favorites?highlightId=${jobId}`);
            }
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={handleToggleClick}
                disabled={loading}
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isFavorite ? '#fff1f2' : 'white',
                    color: isFavorite ? '#ef4444' : '#94a3b8',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    padding: 0
                }}
                title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
            >
                <Heart size={20} fill={isFavorite ? "#ef4444" : "none"} />
            </button>

            <ConfirmModal
                isOpen={showConfirm}
                title={isFavorite ? "Bỏ yêu thích?" : "Lưu yêu thích?"}
                message={isFavorite 
                    ? "Bạn có chắc chắn muốn bỏ công việc này khỏi danh sách yêu thích của mình?" 
                    : "Bạn muốn lưu công việc này vào danh sách yêu thích để xem lại sau?"}
                confirmText={isFavorite ? "Bỏ lưu" : "Lưu ngay"}
                type={isFavorite ? 'danger' : 'success'}
                onConfirm={handleConfirm}
                onCancel={() => setShowConfirm(false)}
                showCategorySelection={!isFavorite}
            />
        </>
    );
};
