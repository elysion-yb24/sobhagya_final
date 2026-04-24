"use client";
import React, { useState, useEffect } from 'react';

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

// Inject keyframes once at module load instead of on every render via <style jsx global>.
// Using translate3d forces GPU compositing on older/lower-end devices.
const DAKSHINA_STYLE_ID = '__dksh_modal_keyframes__';
if (typeof document !== 'undefined' && !document.getElementById(DAKSHINA_STYLE_ID)) {
    const style = document.createElement('style');
    style.id = DAKSHINA_STYLE_ID;
    style.textContent = `
        @keyframes dksh-fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dksh-slideUp {
            from { transform: translate3d(-50%, 100%, 0); }
            to   { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes dksh-scaleIn {
            from { opacity: 0; transform: translate3d(0,0,0) scale(0.85); }
            to   { opacity: 1; transform: translate3d(0,0,0) scale(1); }
        }
        @keyframes dksh-sparkle {
            from { opacity: 0; transform: translate3d(0,8px,0) scale(0); }
            to   { opacity: 1; transform: translate3d(0,0,0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
            [data-dksh-anim] { animation-duration: 0.01ms !important; }
        }
    `;
    document.head.appendChild(style);
}

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
    const [animatingIn, setAnimatingIn] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const realGifts = (gifts || []).filter(g => g.active !== false && !String(g._id || '').startsWith('preset_'));
    const hasRealGifts = realGifts.length > 0;
    // When real gifts haven't arrived yet, show FALLBACK_PRESETS as non-clickable
    // skeletons so the layout doesn't shift, but users can't submit a fake id.
    const displayGifts = hasRealGifts ? realGifts : FALLBACK_PRESETS;

    // Fetch on open, and retry every time the modal reopens so transient
    // network/auth failures on first load get another chance.
    useEffect(() => {
        if (isOpen && onFetchGifts && !hasRealGifts) {
            setIsFetching(true);
            Promise.resolve(onFetchGifts()).finally(() => setIsFetching(false));
        }
    }, [isOpen]);

    const handleRetry = () => {
        if (!onFetchGifts || isFetching) return;
        setIsFetching(true);
        Promise.resolve(onFetchGifts()).finally(() => setIsFetching(false));
    };

    // Drop `will-change` after the open animation finishes so the browser can
    // release the GPU layer — keeping will-change permanently actually hurts.
    useEffect(() => {
        if (!isOpen) { setAnimatingIn(false); return; }
        setAnimatingIn(true);
        const t = setTimeout(() => setAnimatingIn(false), 400);
        return () => clearTimeout(t);
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
            {/* Backdrop — blur applied only AFTER slide-up completes so the
                 compositor isn't rasterizing a blurred layer during the transform */}
            <div
                className={`fixed inset-0 z-[200] bg-black/50 ${animatingIn ? '' : 'backdrop-blur-sm'}`}
                onClick={handleClose}
                style={{ animation: 'dksh-fadeIn 0.2s ease-out', willChange: animatingIn ? 'opacity' : 'auto' }}
            />

            {/* Modal */}
            <div
                className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[201] w-full max-w-md max-h-[85vh] overflow-y-auto"
                style={{
                    animation: 'dksh-slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
                    willChange: animatingIn ? 'transform' : 'auto',
                    transform: 'translate3d(-50%, 0, 0)',
                    backfaceVisibility: 'hidden',
                    contain: 'layout paint',
                }}
            >
                <div className="bg-gradient-to-b from-white via-orange-50/60 to-amber-50/40 rounded-t-3xl border-t border-orange-100 shadow-[0_-12px_40px_rgba(249,115,22,0.18)]">
                    {/* Handle */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 rounded-full bg-orange-200" />
                    </div>

                    {/* Success State */}
                    {showSuccess ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6" style={{ animation: 'dksh-scaleIn 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-5 text-white shadow-lg shadow-orange-500/30">
                                {selectedGift?.icon && DakshinaIcons[selectedGift.icon.toLowerCase()]
                                    ? <div className="scale-150">{DakshinaIcons[selectedGift.icon.toLowerCase()]}</div>
                                    : selectedGift?.icon && (selectedGift.icon.startsWith('http') || selectedGift.icon.startsWith('//'))
                                        ? <img src={selectedGift.icon} alt={selectedGift.name || 'gift'} className="w-12 h-12 object-contain" />
                                        : <div className="scale-150">{DakshinaIcons['namaste'] || <span className="text-4xl">🙏</span>}</div>}
                            </div>
                            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Dakshina Sent!</h3>
                            <p className="text-orange-600 text-sm font-semibold">
                                ₹{Math.round(Number(selectedGift?.price) || 0).toLocaleString('en-IN')} offered to {receiverName}
                            </p>
                            <div className="mt-4 flex items-center gap-1">
                                {[0, 1, 2, 3, 4].map(i => (
                                    <span
                                        key={i}
                                        className="text-orange-500 text-xs"
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
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 mb-3 shadow-lg shadow-orange-500/30">
                                    <span className="text-2xl">🙏</span>
                                </div>
                                <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Offer Dakshina</h3>
                                <p className="text-gray-500 text-xs mt-1">
                                    Bless <span className="text-orange-600 font-semibold">{receiverName}</span> with your offering
                                </p>
                            </div>

                            {/* Gift items */}
                            <div className="grid grid-cols-3 gap-2.5 mb-3">
                                {displayGifts.map((gift) => {
                                    const isSelected = hasRealGifts && selectedGift?._id === gift._id;
                                    const iconKey = gift.icon?.toLowerCase();
                                    const svgIcon = DakshinaIcons[iconKey];
                                    const disabled = !hasRealGifts;
                                    return (
                                        <button
                                            key={gift._id}
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => !disabled && setSelectedGift(gift)}
                                            style={{ transition: 'transform 180ms cubic-bezier(0.16,1,0.3,1), background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease' }}
                                            className={`relative flex flex-col items-center gap-1.5 py-4 px-3 rounded-2xl border transform-gpu ${
                                                disabled
                                                    ? 'bg-white/60 border-orange-100/60 opacity-60 cursor-wait animate-pulse'
                                                    : isSelected
                                                        ? 'bg-gradient-to-b from-orange-50 to-amber-50 border-orange-400 shadow-lg shadow-orange-500/15 scale-[1.03]'
                                                        : 'bg-white border-orange-100 hover:bg-orange-50/60 hover:border-orange-200'
                                            }`}
                                        >
                                            <div className={`transition-colors duration-200 ${isSelected ? 'text-orange-600' : 'text-orange-400'}`}>
                                                {svgIcon ? svgIcon
                                                    : gift.icon && (gift.icon.startsWith('http') || gift.icon.startsWith('//'))
                                                        ? <img src={gift.icon} alt={gift.name || 'gift'} className="w-10 h-10 object-contain rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                        : <span className="text-2xl">{gift.icon || '🙏'}</span>
                                                }
                                            </div>
                                            <span className={`text-sm font-extrabold ${
                                                isSelected ? 'text-orange-600' : 'text-gray-800'
                                            }`}>
                                                ₹{Math.round(Number(gift.price) || 0).toLocaleString('en-IN')}
                                            </span>
                                            {gift.name && (
                                                <span className={`text-[10px] truncate max-w-full font-medium ${isSelected ? 'text-orange-500' : 'text-gray-400'}`}>{gift.name}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Loading / retry state */}
                            {!hasRealGifts && (
                                <div className="flex items-center justify-between bg-orange-50/70 border border-orange-100 rounded-xl px-4 py-2.5 mb-4">
                                    <span className="text-xs text-orange-700 font-medium flex items-center gap-2">
                                        {isFetching ? (
                                            <>
                                                <span className="w-3 h-3 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
                                                Loading offerings…
                                            </>
                                        ) : (
                                            <>Could not load offerings.</>
                                        )}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleRetry}
                                        disabled={isFetching}
                                        className="text-xs font-bold text-orange-600 hover:text-orange-700 disabled:opacity-50"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                            {/* Send button */}
                            <button
                                onClick={handleSend}
                                disabled={!selectedGift || isSending || !hasRealGifts}
                                style={{ transition: 'transform 150ms ease, box-shadow 200ms ease, background-color 200ms ease' }}
                                className={`w-full py-4 rounded-2xl font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 transform-gpu ${
                                    selectedGift && hasRealGifts
                                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 active:scale-[0.98]'
                                        : 'bg-orange-50 text-orange-300 cursor-not-allowed border border-orange-100'
                                }`}
                            >
                                {isSending ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        <span>Offering...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>🙏</span>
                                        <span>
                                            {!hasRealGifts
                                                ? 'Loading offerings…'
                                                : selectedGift
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
                                className="w-full mt-3 py-3 text-gray-400 text-xs font-semibold tracking-wide hover:text-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </>
    );
};

export default DakshinaModal;
