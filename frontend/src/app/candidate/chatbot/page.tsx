"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Sparkles,
    Send,
    FileText,
    Brain,
    Building2,
    MapPin,
    DollarSign,
    Briefcase,
    ChevronRight,
    ArrowRight,
    Loader2,
    Bot,
    User,
    CheckCircle2,
    AlertCircle,
    Info,
    X,
    Maximize2,
    Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { cvService, CV } from "@/services/cv.service";
import { chatbotService, ChatMessage, SuggestedJob, CVRecommendation } from "@/services/chatbot.service";

export default function CandidateChatbotPage() {
    const { user } = useAuthStore();
    
    // Tab state: 'chat' | 'cv'
    const [activeTab, setActiveTab] = useState<'chat' | 'cv'>('chat');
    
    // CVs list for dropdown or selection
    const [cvList, setCvList] = useState<CV[]>([]);
    const [cvsLoading, setCvsLoading] = useState(false);
    const [selectedCvId, setSelectedCvId] = useState<string>("");
    
    // Chat state
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            role: "model",
            text: "Xin chào! Tôi là Trợ lý tuyển dụng AI của bạn. Tôi có thể giúp bạn tìm kiếm các cơ hội việc làm phù hợp nhất. Bạn muốn tìm kiếm công việc ở lĩnh vực nào, địa điểm nào và có những kỹ năng gì?"
        }
    ]);
    const [inputText, setInputText] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const [chatSuggestedJobs, setChatSuggestedJobs] = useState<SuggestedJob[]>([]);
    
    // CV Match state
    const [cvAnalysis, setCvAnalysis] = useState<string>("");
    const [cvRecommendations, setCvRecommendations] = useState<CVRecommendation[]>([]);
    const [cvSuggestedJobs, setCvSuggestedJobs] = useState<SuggestedJob[]>([]);
    const [cvMatchLoading, setCvMatchLoading] = useState(false);

    // Job Detail Modal State
    const [activeJobDetail, setActiveJobDetail] = useState<SuggestedJob | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Load chat history from localStorage on mount/user load
    useEffect(() => {
        if (user && typeof window !== "undefined") {
            const storedHistory = localStorage.getItem(`candidate_chatbot_history_${user.id}`);
            const storedJobs = localStorage.getItem(`candidate_chatbot_suggested_jobs_${user.id}`);
            if (storedHistory) {
                try {
                    setChatMessages(JSON.parse(storedHistory));
                } catch (e) {
                    console.error("Error parsing stored chatbot history:", e);
                }
            }
            if (storedJobs) {
                try {
                    setChatSuggestedJobs(JSON.parse(storedJobs));
                } catch (e) {
                    console.error("Error parsing stored suggested jobs:", e);
                }
            }
        }
    }, [user]);

    // Save chat history to localStorage whenever it changes
    useEffect(() => {
        if (user && typeof window !== "undefined" && chatMessages.length > 0) {
            localStorage.setItem(`candidate_chatbot_history_${user.id}`, JSON.stringify(chatMessages));
        }
    }, [chatMessages, user]);

    useEffect(() => {
        if (user && typeof window !== "undefined") {
            localStorage.setItem(`candidate_chatbot_suggested_jobs_${user.id}`, JSON.stringify(chatSuggestedJobs));
        }
    }, [chatSuggestedJobs, user]);

    const handleClearHistory = () => {
        if (typeof window !== "undefined" && user) {
            if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện và các công việc được gợi ý không?")) {
                localStorage.removeItem(`candidate_chatbot_history_${user.id}`);
                localStorage.removeItem(`candidate_chatbot_suggested_jobs_${user.id}`);
                setChatMessages([
                    {
                        role: "model",
                        text: "Xin chào! Tôi là Trợ lý tuyển dụng AI của bạn. Tôi có thể giúp bạn tìm kiếm các cơ hội việc làm phù hợp nhất. Bạn muốn tìm kiếm công việc ở lĩnh vực nào, địa điểm nào và có những kỹ năng gì?"
                    }
                ]);
                setChatSuggestedJobs([]);
            }
        }
    };

    // Scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages, chatLoading]);

    // Load candidate's CVs
    useEffect(() => {
        const fetchCvs = async () => {
            try {
                setCvsLoading(true);
                const data = await cvService.getMyCVs();
                setCvsList(data || []);
                if (data && data.length > 0) {
                    const primary = data.find(c => c.isPrimary);
                    setSelectedCvId(primary?.id || data[0].id || "");
                }
            } catch (error) {
                console.error("Failed to load CVs:", error);
            } finally {
                setCvsLoading(false);
            }
        };

        if (user) {
            fetchCvs();
        }
    }, [user]);

    // Handle Chat Submit
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || chatLoading) return;

        const userMsg = inputText.trim();
        setInputText("");
        
        // Add user message to state
        const newHistory = [...chatMessages, { role: "user" as const, text: userMsg }];
        setChatMessages(newHistory);
        setChatLoading(true);

        try {
            // Call API (using optional selectedCvId as context)
            const res = await chatbotService.chat(userMsg, chatMessages, selectedCvId || undefined);
            
            setChatMessages(prev => [...prev, { role: "model" as const, text: res.message }]);
            if (res.suggestedJobs && res.suggestedJobs.length > 0) {
                setChatSuggestedJobs(res.suggestedJobs);
            }
        } catch (error: any) {
            console.error("Chat error:", error);
            setChatMessages(prev => [...prev, {
                role: "model" as const,
                text: `Rất tiếc, tôi đang gặp sự cố khi xử lý thông tin. (Lỗi: ${error.message || 'Không thể kết nối đến máy chủ AI'}). Bạn vui lòng thử lại sau.`
            }]);
        } finally {
            setChatLoading(false);
        }
    };

    // Handle CV Suggestion
    const handleCvAnalysis = async () => {
        if (!selectedCvId || cvMatchLoading) return;

        setCvMatchLoading(true);
        setCvAnalysis("");
        setCvRecommendations([]);
        setCvSuggestedJobs([]);

        try {
            const res = await chatbotService.suggestByCv(selectedCvId);
            setCvAnalysis(res.analysis);
            setCvRecommendations(res.recommendations);
            setCvSuggestedJobs(res.suggestedJobs);
        } catch (error: any) {
            console.error("CV Analysis error:", error);
            alert(`Lỗi phân tích CV: ${error.message || 'Có sự cố xảy ra.'}`);
        } finally {
            setCvMatchLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px 40px 80px", maxWidth: "1400px", margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
            
            {/* Gradient Header */}
            <div style={{ 
                marginBottom: "32px", 
                background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", 
                borderRadius: "32px", 
                padding: "40px", 
                color: "white",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)"
            }}>
                <div style={{ position: "absolute", right: "-30px", top: "-30px", width: "180px", height: "180px", backgroundColor: "rgba(92, 154, 255, 0.08)", borderRadius: "50%" }}></div>
                <div style={{ position: "absolute", right: "120px", bottom: "-40px", width: "120px", height: "120px", backgroundColor: "rgba(92, 154, 255, 0.05)", borderRadius: "50%" }}></div>
                
                <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: "8px", 
                        padding: "8px 16px", 
                        backgroundColor: "rgba(255, 255, 255, 0.08)", 
                        color: "#5C9AFF", 
                        borderRadius: "100px", 
                        fontSize: "12px", 
                        fontWeight: 800, 
                        letterSpacing: "0.05em", 
                        marginBottom: "16px",
                        border: "1px solid rgba(255, 255, 255, 0.1)"
                    }}>
                        <Brain size={14} /> TRỢ LÝ AI COPILOT
                    </div>
                    <h1 style={{ fontSize: "36px", fontWeight: 900, margin: "0 0 12px", letterSpacing: "-0.03em" }}>AI Job Search Assistant</h1>
                    <p style={{ fontSize: "16px", color: "#94A3B8", maxWidth: "700px", margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                        Khám phá công việc phù hợp với năng lực của bạn thông qua RAG vector search. Trò chuyện trực tiếp với AI tuyển dụng hoặc tải CV để nhận gợi ý tức thì.
                    </p>
                </div>
            </div>

            {/* Sub Navigation Tabs */}
            <div style={{ 
                display: "flex", 
                backgroundColor: "#F1F5F9", 
                padding: "6px", 
                borderRadius: "18px", 
                maxWidth: "480px", 
                marginBottom: "32px",
                border: "1px solid #E2E8F0"
            }}>
                <button
                    onClick={() => setActiveTab('chat')}
                    style={{
                        flex: 1,
                        padding: "12px 24px",
                        borderRadius: "14px",
                        border: "none",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        transition: "all 0.2s ease",
                        backgroundColor: activeTab === 'chat' ? "white" : "transparent",
                        color: activeTab === 'chat' ? "#0F172A" : "#64748B",
                        boxShadow: activeTab === 'chat' ? "0 4px 12px rgba(0,0,0,0.05)" : "none"
                    }}
                >
                    <Sparkles size={16} color={activeTab === 'chat' ? "#5C9AFF" : "#64748B"} /> Trò chuyện thông minh
                </button>
                <button
                    onClick={() => setActiveTab('cv')}
                    style={{
                        flex: 1,
                        padding: "12px 24px",
                        borderRadius: "14px",
                        border: "none",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        transition: "all 0.2s ease",
                        backgroundColor: activeTab === 'cv' ? "white" : "transparent",
                        color: activeTab === 'cv' ? "#0F172A" : "#64748B",
                        boxShadow: activeTab === 'cv' ? "0 4px 12px rgba(0,0,0,0.05)" : "none"
                    }}
                >
                    <FileText size={16} color={activeTab === 'cv' ? "#5C9AFF" : "#64748B"} /> Gợi ý qua CV
                </button>
            </div>

            {/* Split Screen Container */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "32px", alignItems: "start" }}>
                
                {/* LEFT PANEL: Interactive Area */}
                <div style={{ 
                    backgroundColor: "white", 
                    borderRadius: "32px", 
                    border: "1px solid #E2E8F0", 
                    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    height: "650px"
                }}>
                    {activeTab === 'chat' ? (
                        <>
                            {/* Chat Header / Configuration */}
                            <div style={{ padding: "16px 24px", borderBottom: "1px solid #F1F5F9", backgroundColor: "#F8FAFC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <div style={{ width: "8px", height: "8px", backgroundColor: "#22C55E", borderRadius: "50%" }}></div>
                                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>AI Recruiter Online</span>
                                    </div>
                                    {chatMessages.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={handleClearHistory}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: "#EF4444",
                                                fontSize: "11px",
                                                fontWeight: 700,
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px",
                                                padding: "4px 8px",
                                                borderRadius: "8px",
                                                backgroundColor: "#FEF2F2",
                                                transition: "all 0.2s ease"
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = "#FEE2E2";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = "#FEF2F2";
                                            }}
                                        >
                                            <Trash2 size={12} /> Xóa lịch sử
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>Sử dụng thông tin CV làm bối cảnh:</span>
                                    <select
                                        value={selectedCvId}
                                        onChange={(e) => setSelectedCvId(e.target.value)}
                                        style={{ 
                                            padding: "6px 12px", 
                                            borderRadius: "10px", 
                                            border: "1px solid #E2E8F0", 
                                            fontSize: "12px", 
                                            fontWeight: 600,
                                            backgroundColor: "white",
                                            outline: "none"
                                        }}
                                    >
                                        <option value="">Không sử dụng CV</option>
                                        {cvList.map(cv => (
                                            <option key={cv.id} value={cv.id}>{cv.cvTitle} {cv.isPrimary ? "(Mặc định)" : ""}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Chat History Messages Stream */}
                            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#FCFDFE" }}>
                                {chatMessages.map((msg, index) => {
                                    const isBot = msg.role === 'model';
                                    return (
                                        <div key={index} style={{ display: "flex", justifyContent: isBot ? "flex-start" : "flex-end", gap: "12px" }}>
                                            {isBot && (
                                                <div style={{ 
                                                    width: "36px", 
                                                    height: "36px", 
                                                    borderRadius: "12px", 
                                                    backgroundColor: "#EFF6FF", 
                                                    border: "1px solid #DBEAFE", 
                                                    display: "flex", 
                                                    alignItems: "center", 
                                                    justifyContent: "center",
                                                    flexShrink: 0
                                                }}>
                                                    <Bot size={18} color="#5C9AFF" />
                                                </div>
                                            )}
                                            <div style={{
                                                maxWidth: "75%",
                                                padding: "14px 18px",
                                                borderRadius: "20px",
                                                fontSize: "14px",
                                                lineHeight: 1.6,
                                                backgroundColor: isBot ? "white" : "#5C9AFF",
                                                color: isBot ? "#334155" : "white",
                                                border: isBot ? "1px solid #E2E8F0" : "none",
                                                boxShadow: isBot ? "0 2px 4px rgba(0,0,0,0.01)" : "0 8px 16px rgba(92, 154, 255, 0.15)",
                                                borderTopLeftRadius: isBot ? "4px" : "20px",
                                                borderTopRightRadius: isBot ? "20px" : "4px"
                                            }}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                {chatLoading && (
                                    <div style={{ display: "flex", justifyContent: "flex-start", gap: "12px" }}>
                                        <div style={{ 
                                            width: "36px", 
                                            height: "36px", 
                                            borderRadius: "12px", 
                                            backgroundColor: "#EFF6FF", 
                                            border: "1px solid #DBEAFE", 
                                            display: "flex", 
                                            alignItems: "center", 
                                            justifyContent: "center"
                                        }}>
                                            <Bot size={18} color="#5C9AFF" />
                                        </div>
                                        <div style={{ backgroundColor: "white", padding: "14px 20px", borderRadius: "20px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "8px" }}>
                                            <Loader2 size={16} className="animate-spin" color="#5C9AFF" />
                                            <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 500 }}>AI đang phân tích tìm kiếm...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input Bar */}
                            <div style={{ padding: "20px 24px", borderTop: "1px solid #F1F5F9", backgroundColor: "white" }}>
                                <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "12px" }}>
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Nhập tin nhắn..."
                                        disabled={chatLoading}
                                        style={{
                                            flex: 1,
                                            padding: "14px 20px",
                                            borderRadius: "16px",
                                            border: "1.5px solid #E2E8F0",
                                            fontSize: "14px",
                                            outline: "none",
                                            transition: "all 0.2s",
                                            backgroundColor: chatLoading ? "#F8FAFC" : "white"
                                        }}
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!inputText.trim() || chatLoading}
                                        style={{ 
                                            padding: "14px 24px", 
                                            backgroundColor: "#0F172A", 
                                            color: "white", 
                                            border: "none", 
                                            borderRadius: "16px", 
                                            fontSize: "14px",
                                            fontWeight: 700,
                                            cursor: (inputText.trim() && !chatLoading) ? "pointer" : "not-allowed",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            opacity: (inputText.trim() && !chatLoading) ? 1 : 0.6,
                                            transition: "all 0.2s"
                                        }}
                                    >
                                        Gửi <Send size={16} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        /* Method 2: Select CV for matching analysis */
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "32px", overflowY: "auto" }}>
                            <div style={{ marginBottom: "24px" }}>
                                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: "0 0 8px" }}>Phân tích sự tương thích qua CV</h3>
                                <p style={{ fontSize: "14px", color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                                    Hãy chọn một trong những CV chuyên nghiệp của bạn dưới đây. AI sẽ phân tích hồ sơ kỹ năng của bạn và so khớp với toàn bộ công việc tuyển dụng trong hệ thống.
                                </p>
                            </div>

                            {cvsLoading ? (
                                <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                                    <Loader2 size={32} className="animate-spin" color="#5C9AFF" />
                                </div>
                            ) : cvList.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "40px 20px", border: "2px dashed #E2E8F0", borderRadius: "20px" }}>
                                    <FileText size={40} color="#94A3B8" style={{ marginBottom: "12px", opacity: 0.5 }} />
                                    <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#475569", margin: "0 0 8px" }}>Không tìm thấy CV nào</h4>
                                    <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 16px" }}>Bạn cần khởi tạo CV trước khi sử dụng chức năng này.</p>
                                    <a href="/candidate/cv" style={{ padding: "8px 16px", backgroundColor: "#5C9AFF", color: "white", textDecoration: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700 }}>Tạo CV ngay</a>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
                                    {cvList.map(cv => (
                                        <div 
                                            key={cv.id}
                                            onClick={() => setSelectedCvId(cv.id || "")}
                                            style={{
                                                padding: "20px",
                                                borderRadius: "20px",
                                                border: selectedCvId === cv.id ? "2px solid #5C9AFF" : "1px solid #E2E8F0",
                                                backgroundColor: selectedCvId === cv.id ? "#F0F9FF" : "white",
                                                cursor: "pointer",
                                                transition: "all 0.2s ease",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between"
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                                <div style={{ 
                                                    width: "44px", 
                                                    height: "44px", 
                                                    borderRadius: "12px", 
                                                    backgroundColor: selectedCvId === cv.id ? "#EFF6FF" : "#F8FAFC", 
                                                    display: "flex", 
                                                    alignItems: "center", 
                                                    justifyContent: "center"
                                                }}>
                                                    <FileText size={22} color={selectedCvId === cv.id ? "#5C9AFF" : "#64748B"} />
                                                </div>
                                                <div>
                                                    <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", margin: "0 0 4px" }}>{cv.cvTitle}</h4>
                                                    <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>Cập nhật: {new Date(cv.updatedAt || "").toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            {cv.isPrimary && (
                                                <span style={{ fontSize: "11px", fontWeight: 800, backgroundColor: "#E0F2FE", color: "#0369A1", padding: "4px 10px", borderRadius: "100px" }}>Mặc định</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {cvList.length > 0 && (
                                <button
                                    onClick={handleCvAnalysis}
                                    disabled={cvMatchLoading || !selectedCvId}
                                    style={{
                                        padding: "16px",
                                        backgroundColor: "#0F172A",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "16px",
                                        fontSize: "15px",
                                        fontWeight: 700,
                                        cursor: cvMatchLoading ? "not-allowed" : "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "10px",
                                        boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                                        marginBottom: "32px"
                                    }}
                                >
                                    {cvMatchLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" /> Đang chạy thuật toán RAG...
                                        </>
                                    ) : (
                                        <>
                                            Phân tích CV & Gợi ý công việc <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            )}

                            {/* CV Analysis Output */}
                            {cvAnalysis && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ 
                                        padding: "24px", 
                                        backgroundColor: "#F8FAFC", 
                                        borderRadius: "24px", 
                                        border: "1px solid #F1F5F9"
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#5C9AFF" }}>
                                        <Bot size={20} />
                                        <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>Lời khuyên từ Trợ lý AI</h4>
                                    </div>
                                    <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.7, margin: 0 }}>
                                        {cvAnalysis}
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL: Suggested Jobs Container */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                            <Briefcase size={20} color="#5C9AFF" /> Công việc gợi ý
                        </h3>
                        <span style={{ 
                            fontSize: "11px", 
                            fontWeight: 800, 
                            backgroundColor: "#EFF6FF", 
                            color: "#5C9AFF", 
                            padding: "4px 10px", 
                            borderRadius: "100px" 
                        }}>
                            RAG Search
                        </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {activeTab === 'chat' ? (
                            chatSuggestedJobs.length === 0 ? (
                                <div style={{ 
                                    padding: "48px 24px", 
                                    backgroundColor: "white", 
                                    border: "1px solid #E2E8F0", 
                                    borderRadius: "24px", 
                                    textAlign: "center",
                                    color: "#94A3B8"
                                }}>
                                    <Brain size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                                    <p style={{ fontSize: "13px", fontWeight: 600, margin: 0 }}>
                                        Hãy trò chuyện thêm để Trợ lý AI gợi ý công việc phù hợp tại đây.
                                    </p>
                                </div>
                            ) : (
                                chatSuggestedJobs.map(job => (
                                    <JobCard 
                                        key={job.id} 
                                        job={job} 
                                        onViewDetail={() => setActiveJobDetail(job)} 
                                    />
                                ))
                            )
                        ) : (
                            cvSuggestedJobs.length === 0 ? (
                                <div style={{ 
                                    padding: "48px 24px", 
                                    backgroundColor: "white", 
                                    border: "1px solid #E2E8F0", 
                                    borderRadius: "24px", 
                                    textAlign: "center",
                                    color: "#94A3B8"
                                }}>
                                    <FileText size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                                    <p style={{ fontSize: "13px", fontWeight: 600, margin: 0 }}>
                                        Chọn CV và nhấn "Phân tích CV" để xem kết quả đề xuất.
                                    </p>
                                </div>
                            ) : (
                                cvSuggestedJobs.map(job => {
                                    // Find recommendation matches if any
                                    const rec = cvRecommendations.find(r => r.jobId === job.id);
                                    return (
                                        <JobCard 
                                            key={job.id} 
                                            job={job} 
                                            recommendation={rec}
                                            onViewDetail={() => setActiveJobDetail(job)} 
                                        />
                                    );
                                })
                            )
                        )}
                    </div>
                </div>

            </div>

            {/* JOB DETAILS MODAL */}
            <AnimatePresence>
                {activeJobDetail && (
                    <div style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(15, 23, 42, 0.7)",
                        backdropFilter: "blur(12px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        padding: "20px"
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            style={{
                                backgroundColor: "white",
                                width: "100%",
                                maxWidth: "750px",
                                maxHeight: "85vh",
                                borderRadius: "24px",
                                overflowY: "auto",
                                position: "relative",
                                border: "1px solid #E2E8F0",
                                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
                            }}
                        >
                            {/* Modal Header */}
                            <div style={{ 
                                position: "sticky", 
                                top: 0, 
                                left: 0, 
                                right: 0, 
                                padding: "20px 28px", 
                                borderBottom: "1px solid #F1F5F9", 
                                backgroundColor: "rgba(255, 255, 255, 0.9)", 
                                backdropFilter: "blur(8px)", 
                                display: "flex", 
                                justifyContent: "space-between", 
                                alignItems: "center", 
                                zIndex: 10 
                            }}>
                                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: 0 }}>Thông tin tuyển dụng</h3>
                                <button 
                                    onClick={() => setActiveJobDetail(null)} 
                                    style={{ padding: "8px", borderRadius: "10px", border: "none", backgroundColor: "#F1F5F9", cursor: "pointer", display: "flex" }}
                                >
                                    <X size={18} color="#64748B" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div style={{ padding: "32px 36px" }}>
                                <div style={{ display: "flex", gap: "20px", marginBottom: "28px" }}>
                                    <div style={{ 
                                        width: "64px", 
                                        height: "64px", 
                                        backgroundColor: "#F8FAFC", 
                                        borderRadius: "16px", 
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "center",
                                        border: "1px solid #E2E8F0",
                                        flexShrink: 0
                                    }}>
                                        {activeJobDetail.companyLogo ? (
                                            <img src={activeJobDetail.companyLogo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "14px" }} />
                                        ) : (
                                            <Building2 size={32} color="#5C9AFF" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>{activeJobDetail.title}</h2>
                                        <div style={{ fontSize: "15px", fontWeight: 700, color: "#5C9AFF" }}>{activeJobDetail.companyName}</div>
                                    </div>
                                </div>

                                <div style={{ 
                                    display: "grid", 
                                    gridTemplateColumns: "1fr 1fr", 
                                    gap: "16px", 
                                    padding: "20px", 
                                    backgroundColor: "#F8FAFC", 
                                    borderRadius: "20px", 
                                    border: "1px solid #F1F5F9",
                                    marginBottom: "28px"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#475569" }}>
                                        <MapPin size={16} color="#94A3B8" /> {activeJobDetail.workLocation || "N/A"}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#475569" }}>
                                        <DollarSign size={16} color="#94A3B8" /> {activeJobDetail.minSalary ? `${activeJobDetail.minSalary} - ${activeJobDetail.maxSalary} USD` : "Thỏa thuận"}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#475569" }}>
                                        <Briefcase size={16} color="#94A3B8" /> {activeJobDetail.type || "Toàn thời gian"}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#475569" }}>
                                        <Brain size={16} color="#94A3B8" /> Độ khớp: {(activeJobDetail.similarityScore * 100).toFixed(0)}%
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.02em" }}>Chi tiết công việc</h4>
                                    <p style={{ 
                                        fontSize: "14px", 
                                        color: "#475569", 
                                        lineHeight: 1.7, 
                                        whiteSpace: "pre-line", 
                                        margin: 0 
                                    }}>
                                        {activeJobDetail.description}
                                    </p>
                                </div>

                                <div style={{ 
                                    marginTop: "40px", 
                                    display: "flex", 
                                    gap: "16px", 
                                    borderTop: "1px solid #F1F5F9", 
                                    paddingTop: "24px" 
                                }}>
                                    <button 
                                        onClick={() => {
                                            // Handle redirection to job page if available
                                            window.location.href = `/candidate/jobs/${activeJobDetail.id}`;
                                        }}
                                        style={{ 
                                            flex: 1, 
                                            padding: "14px", 
                                            backgroundColor: "#5C9AFF", 
                                            color: "white", 
                                            borderRadius: "12px", 
                                            border: "none", 
                                            fontSize: "14px", 
                                            fontWeight: 700, 
                                            cursor: "pointer",
                                            boxShadow: "0 4px 12px rgba(92,154,255,0.15)",
                                            textAlign: "center"
                                        }}
                                    >
                                        Ứng tuyển & Xem chi tiết ↗
                                    </button>
                                    <button 
                                        onClick={() => setActiveJobDetail(null)}
                                        style={{ 
                                            padding: "14px 28px", 
                                            backgroundColor: "white", 
                                            color: "#475569", 
                                            borderRadius: "12px", 
                                            border: "1px solid #E2E8F0", 
                                            fontSize: "14px", 
                                            fontWeight: 700, 
                                            cursor: "pointer" 
                                        }}
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Subcomponent: JobCard
interface JobCardProps {
    job: SuggestedJob;
    recommendation?: CVRecommendation;
    onViewDetail: () => void;
}

function JobCard({ job, recommendation, onViewDetail }: JobCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                backgroundColor: "white",
                borderRadius: "24px",
                border: "1px solid #E2E8F0",
                padding: "20px",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                cursor: "default"
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#0F172A";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.04)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.02)";
            }}
        >
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                <div style={{ 
                    width: "48px", 
                    height: "48px", 
                    borderRadius: "12px", 
                    backgroundColor: "#F8FAFC", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    border: "1px solid #E2E8F0",
                    flexShrink: 0
                }}>
                    {job.companyLogo ? (
                        <img src={job.companyLogo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "10px" }} />
                    ) : (
                        <Building2 size={24} color="#5C9AFF" />
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <h4 style={{ 
                            fontSize: "15px", 
                            fontWeight: 800, 
                            color: "#0F172A", 
                            margin: "0 0 2px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}>
                            {job.title}
                        </h4>
                        <span style={{ 
                            fontSize: "11px", 
                            fontWeight: 800, 
                            color: "#22C55E", 
                            backgroundColor: "#F0FDF4", 
                            padding: "2px 8px", 
                            borderRadius: "100px",
                            marginLeft: "8px"
                        }}>
                            {(job.similarityScore * 100).toFixed(0)}% Match
                        </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#5C9AFF", fontWeight: 700 }}>{job.companyName}</div>
                </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#64748B", fontWeight: 600 }}>
                    <MapPin size={12} color="#94A3B8" /> {job.workLocation || "N/A"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#64748B", fontWeight: 600 }}>
                    <DollarSign size={12} color="#94A3B8" /> {job.minSalary ? `${job.minSalary} - ${job.maxSalary} USD` : "Thỏa thuận"}
                </div>
            </div>

            {/* Recommendation Details */}
            {recommendation && (
                <div style={{ 
                    padding: "12px 16px", 
                    backgroundColor: "#F8FAFC", 
                    borderRadius: "16px", 
                    border: "1px solid #F1F5F9", 
                    fontSize: "12px", 
                    lineHeight: 1.5,
                    marginBottom: "16px",
                    color: "#475569"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 800, color: "#0F172A", marginBottom: "4px" }}>
                        <CheckCircle2 size={14} color="#22C55E" /> Phân tích tương thích:
                    </div>
                    <div>{recommendation.matchReason}</div>
                    
                    {recommendation.highlightSkills?.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                            {recommendation.highlightSkills.map((sk, idx) => (
                                <span key={idx} style={{ 
                                    fontSize: "10px", 
                                    fontWeight: 700, 
                                    color: "#0284C7", 
                                    backgroundColor: "#E0F2FE", 
                                    padding: "2px 6px", 
                                    borderRadius: "4px" 
                                }}>
                                    {sk}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <button 
                onClick={onViewDetail}
                style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "transparent",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#475569",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F8FAFC";
                    e.currentTarget.style.color = "#0F172A";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#475569";
                }}
            >
                Xem chi tiết công việc <Maximize2 size={12} />
            </button>
        </motion.div>
    );
}
