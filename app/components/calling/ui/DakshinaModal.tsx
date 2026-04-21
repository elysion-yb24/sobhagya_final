"use client";
import React, { useState } from 'react';

interface GiftItem {
    _id: string;
    name: string;
    icon: string;
    price: number;
    active?: boolean;
}

interface DakshinaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (gift: GiftItem) => void;
    receiverName: string;
    gifts?: GiftItem[];
    onFetchGifts?: () => void;
}

// Astrology & devotional SVG icons for each dakshina tier
const DakshinaIcons: Record<string, React.ReactNode> = {
    // 🕉 Om symbol
    om: (
        <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
            <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.5" opacity="0.15"/>
            <text x="24" y="32" textAnchor="middle" fontSize="28" fill="currentColor" fontFamily="serif">ॐ</text>
        </svg>
    ),
    // 🪔 Diya / Lamp
    diya: (
        <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
            <ellipse cx="24" cy="34" rx="14" ry="5" fill="currentColor" opacity="0.2"/>
            <path d="M16 34c0-4 3.5-8 8-8s8 4 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M24 26v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M24 14c-1.5-3 0-6 0-6s1.5 3 0 6z" fill="#F59E0B" stroke="#F59E0B" strokeWidth="0.5"/>
            <path d="M21 16c-2-1.5-1-4-1-4s1 2 2.5 3z" fill="#FB923C" opacity="0.7"/>
        </svg>
    ),
    // 🌺 Lotus
    lotus: (
        <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
            <path d="M24 36c-3-4-8-8-8-14 0-4 3-7 8-7s8 3 8 7c0 6-5 10-8 14z" fill="currentColor" opacity="0.15"/>
            <path d="M24 12c2 3 2 8 0 12M18 16c3 1 6 4 6 8M30 16c-3 1-6 4-6 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="24" cy="22" r="2.5" fill="currentColor" opacity="0.3"/>
            <path d="M16 28c2-2 5-3 8-3s6 1 8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M14 32c3-2 6-3 10-3s7 1 10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    ),
    // 🙏 Namaste hands
    namaste: (
        <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
            <path d="M19 32l-1-10c0-2 1-4 3-5l3-2 3 2c2 1 3 3 3 5l-1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 22v-4c0-1.5 1.5-3 3-3s3 1.5 3 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M24 10v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M19 13l2 2M29 13l-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M17 34h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    ),
    // ⭐ Nakshatra / Star
    star: (
        <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
            <path d="M24 6l5.5 11.2 12.3 1.8-8.9 8.7 2.1 12.3L24 34l-11 5.8 2.1-12.3-8.9-8.7 12.3-1.8z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="24" cy="22" r="4" fill="currentColor" opacity="0.2"/>
        </svg>
    ),
    // 🔱 Trishul
    trishul: (
        <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
            <path d="M24 40V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M24 16c0-4-4-8-6-10 0 4 2 7 6 10z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1"/>
            <path d="M24 16c0-4 4-8 6-10 0 4-2 7-6 10z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1"/>
            <path d="M24 8V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M20 34h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="24" cy="18" r="1.5" fill="currentColor" opacity="0.4"/>
        </svg>
    ),
};

const ICON_KEYS = ['om', 'diya', 'lotus', 'namaste', 'star', 'trishul'];
const ICON_LABELS = ['Om', 'Diya', 'Lotus', 'Namaste', 'Nakshatra', 'Trishul'];

const FALLBACK_PRESETS: GiftItem[] = [
    { _id: 'preset_11', name: 'Om', icon: 'om', price: 11 },
    { _id: 'preset_21', name: 'Diya', icon: 'diya', price: 21 },
    { _id: 'preset_51', name: 'Lotus', icon: 'lotus', price: 51 },
    { _id: 'preset_101', name: 'Namaste', icon: 'namaste', price: 101 },
    { _id: 'preset_251', name: 'Nakshatra', icon: 'star', price: 251 },
    { _id: 'preset_501', name: 'Trishul', icon: 'trishul', price: 501 },
];

const DakshinaModal: React.FC<DakshinaModalProps> = ({ isOpen, onClose, onSend, receiverName, gifts, onFetchGifts }) => {
    const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const displayGifts = (gifts && gifts.length > 0) ? gifts.filter(g => g.active !== false) : FALLBACK_PRESETS;

    React.useEffect(() => {
        if (isOpen && onFetchGifts && (!gifts || gifts.length === 0)) {
            onFetchGifts();
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!selectedGift) return;
        setIsSending(true);
        try {
            await onSend(selectedGift);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setSelectedGift(null);
                onClose();
            }, 1800);
        } catch (e) {
            console.log('Dakshina send failed:', e);
        } finally {
            setIsSending(false);
        }
    };

    const handleClose = () => {
        if (isSending) return;
        setSelectedGift(null);
        setShowSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
                style={{ animation: 'dksh-fadeIn 0.2s ease-out' }}
            />

            {/* Modal */}
            <div
                className="fixed bottom-0 inset-x-0 z-[201] max-h-[85vh] overflow-y-auto"
                style={{ animation: 'dksh-slideUp 0.35s cubic-bezier(0.16,1,0.3,1)' }}
            >
                <div className="bg-gradient-to-b from-[#1a0e2e] to-[#110a1f] rounded-t-3xl border-t border-white/10 shadow-2xl">
                    {/* Handle */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 rounded-full bg-white/20" />
                    </div>

                    {/* Success State */}
                    {showSuccess ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6" style={{ animation: 'dksh-scaleIn 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 border-2 border-amber-400/40 flex items-center justify-center mb-5 text-amber-400">
                                {selectedGift?.icon && DakshinaIcons[selectedGift.icon.toLowerCase()]
                                    ? <div className="scale-150">{DakshinaIcons[selectedGift.icon.toLowerCase()]}</div>
                                    : selectedGift?.icon && (selectedGift.icon.startsWith('http') || selectedGift.icon.startsWith('//'))
                                        ? <img src={selectedGift.icon} alt={selectedGift.name || 'gift'} className="w-12 h-12 object-contain" />
                                        : <div className="scale-150">{DakshinaIcons['namaste'] || <span className="text-4xl">🙏</span>}</div>}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Dakshina Sent!</h3>
                            <p className="text-amber-300/80 text-sm">
                                ₹{Math.round(Number(selectedGift?.price) || 0)} offered to {receiverName}
                            </p>
                            <div className="mt-4 flex items-center gap-1">
                                {[0, 1, 2, 3, 4].map(i => (
                                    <span
                                        key={i}
                                        className="text-amber-400 text-xs"
                                        style={{ animation: `dksh-sparkle 0.6s ease-out ${i * 0.1}s both` }}
                                    >
                                        ✦
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="px-5 pb-8 pt-3">
                            {/* Header */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-400/20 mb-3">
                                    <span className="text-2xl">🙏</span>
                                </div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Offer Dakshina</h3>
                                <p className="text-white/40 text-xs mt-1">
                                    Bless <span className="text-amber-300/70">{receiverName}</span> with your offering
                                </p>
                            </div>

                            {/* Gift items */}
                            <div className="grid grid-cols-3 gap-2.5 mb-5">
                                {displayGifts.map((gift, idx) => {
                                    const isSelected = selectedGift?._id === gift._id;
                                    // Use SVG icon if available, otherwise fallback to emoji
                                    const iconKey = gift.icon?.toLowerCase();
                                    const svgIcon = DakshinaIcons[iconKey];
                                    return (
                                        <button
                                            key={gift._id}
                                            onClick={() => setSelectedGift(gift)}
                                            className={`relative flex flex-col items-center gap-1.5 py-4 px-3 rounded-2xl border transition-all duration-200 ${
                                                isSelected
                                                    ? 'bg-gradient-to-b from-amber-500/20 to-orange-600/10 border-amber-400/40 shadow-lg shadow-amber-500/10 scale-[1.02]'
                                                    : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10'
                                            }`}
                                        >
                                            <div className={`transition-colors duration-200 ${isSelected ? 'text-amber-400' : 'text-amber-300/60'}`}>
                                                {svgIcon ? svgIcon
                                                    : gift.icon && (gift.icon.startsWith('http') || gift.icon.startsWith('//'))
                                                        ? <img src={gift.icon} alt={gift.name || 'gift'} className="w-10 h-10 object-contain rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                        : <span className="text-2xl">{gift.icon || '🙏'}</span>
                                                }
                                            </div>
                                            <span className={`text-sm font-bold ${
                                                isSelected ? 'text-amber-300' : 'text-white/70'
                                            }`}>
                                                ₹{Math.round(Number(gift.price) || 0)}
                                            </span>
                                            {gift.name && (
                                                <span className={`text-[10px] truncate max-w-full ${isSelected ? 'text-amber-200/60' : 'text-white/40'}`}>{gift.name}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Send button */}
                            <button
                                onClick={handleSend}
                                disabled={!selectedGift || isSending}
                                className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
                                    selectedGift
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98]'
                                        : 'bg-white/[0.05] text-white/20 cursor-not-allowed'
                                }`}
                            >
                                {isSending ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Offering...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>🙏</span>
                                        <span>
                                            {selectedGift
                                                ? `Offer ₹${Math.round(Number(selectedGift.price) || 0)} Dakshina`
                                                : 'Select an amount'
                                            }
                                        </span>
                                    </>
                                )}
                            </button>

                            {/* Cancel */}
                            <button
                                onClick={handleClose}
                                className="w-full mt-3 py-3 text-white/30 text-xs font-medium tracking-wide hover:text-white/50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes dksh-fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes dksh-slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                @keyframes dksh-scaleIn {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes dksh-sparkle {
                    from { opacity: 0; transform: scale(0) translateY(8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </>
    );
};

export default DakshinaModal;
