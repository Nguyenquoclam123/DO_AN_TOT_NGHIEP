"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface SuccessPopupProps {
    show: boolean;
    title: string;
    message: string;
    onClose?: () => void;
}

export default function SuccessPopup({ show, title, message, onClose }: SuccessPopupProps) {
    return (
        <AnimatePresence>
            {show && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(4px)'
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 400 }}
                        style={{
                            backgroundColor: 'white',
                            padding: '40px',
                            borderRadius: '24px',
                            textAlign: 'center',
                            maxWidth: '440px',
                            width: '90%',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        {/* Success Icon with Glow */}
                        <div style={{ position: 'relative', marginBottom: '32px' }}>
                            <div style={{ 
                                position: 'absolute', 
                                top: '50%', 
                                left: '50%', 
                                transform: 'translate(-50%, -50%)',
                                width: '100px', 
                                height: '100px', 
                                backgroundColor: '#E6EFFF', 
                                borderRadius: '50%',
                                filter: 'blur(20px)',
                                opacity: 0.8
                            }} />
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, type: "spring" }}
                                style={{
                                    position: 'relative',
                                    width: '64px',
                                    height: '64px',
                                    backgroundColor: '#5C9AFF',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    boxShadow: '0 8px 16px rgba(92, 154, 255, 0.3)'
                                }}
                            >
                                <Check size={32} strokeWidth={3} />
                            </motion.div>
                        </div>

                        <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>
                            {title}
                        </h3>
                        <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.6, margin: '0 0 32px' }}>
                            {message}
                        </p>

                        <button
                            onClick={onClose}
                            style={{
                                width: '100%',
                                padding: '14px',
                                backgroundColor: '#F0F6FF',
                                color: '#5C9AFF',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E6EFFF'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F0F6FF'}
                        >
                            {onClose ? "Close" : "Redirecting..."}
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
