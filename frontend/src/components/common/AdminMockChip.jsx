import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useProfileContext } from '../../context/ProfileContext';

const AdminMockChip = () => {
    const { profileData, toggleAdmin } = useProfileContext();
    const [position, setPosition] = useState({ x: null, y: null });
    const [dragging, setDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const hasDragged = useRef(false);
    const chipRef = useRef(null);

    useEffect(() => {
        if (chipRef.current && position.x === null) {
            const rect = chipRef.current.getBoundingClientRect();
            setPosition({
                x: window.innerWidth - rect.width - 16,
                y: 16,
            });
        }
    }, [profileData]);

    // Clamp position within viewport
    const clamp = useCallback((x, y) => {
        if (!chipRef.current) return { x, y };
        const w = chipRef.current.offsetWidth;
        const h = chipRef.current.offsetHeight;
        return {
            x: Math.min(Math.max(0, x), window.innerWidth - w),
            y: Math.min(Math.max(0, y), window.innerHeight - h),
        };
    }, []);

    // ── Mouse ──────────────────────────────────────────────
    const handleMouseDown = (e) => {
        hasDragged.current = false;
        dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        setDragging(true);
        e.preventDefault();
    };

    useEffect(() => {
        if (!dragging) return;

        const onMove = (e) => {
            hasDragged.current = true;
            setPosition(clamp(e.clientX - dragOffset.current.x, e.clientY - dragOffset.current.y));
        };
        const onUp = () => setDragging(false);

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [dragging, clamp]);

    // ── Touch ──────────────────────────────────────────────
    const handleTouchStart = (e) => {
        hasDragged.current = false;
        const touch = e.touches[0];
        dragOffset.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
        setDragging(true);
    };

    useEffect(() => {
        if (!dragging) return;

        const onMove = (e) => {
            hasDragged.current = true;
            const touch = e.touches[0];
            setPosition(clamp(touch.clientX - dragOffset.current.x, touch.clientY - dragOffset.current.y));
            e.preventDefault(); // prevent page scroll while dragging
        };
        const onEnd = () => setDragging(false);

        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onEnd);
        return () => {
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onEnd);
        };
    }, [dragging, clamp]);

    // ── Click guard ────────────────────────────────────────
    const handleClick = () => {
        if (!hasDragged.current) toggleAdmin();
    };

    if (!profileData) return null;

    return (
        <div
            ref={chipRef}
            className={`fixed z-50 px-4 py-2 rounded-full shadow-lg font-bold text-sm select-none
                transition-[background-color,box-shadow,transform] duration-150
                ${dragging ? 'cursor-grabbing scale-110 shadow-2xl' : 'cursor-grab'}
                ${profileData.is_admin
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
            style={position.x !== null ? { left: position.x, top: position.y } : { top: 16, right: 16 }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onClick={handleClick}
            title="Drag to move · Click to toggle role"
        >
            Role: {profileData.is_admin ? 'Admin' : 'User'}
        </div>
    );
};

export default AdminMockChip;