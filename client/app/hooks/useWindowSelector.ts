import { useState, useRef, useEffect } from 'react';

export const useWindowSelector = (fullDataLength: number) => {
    const [windowStart, setWindowStart] = useState(0);
    const [windowSize, setWindowSize] = useState(2000);
    const navigationChartRef = useRef<HTMLDivElement>(null);
    const windowSelectorRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const isResizingRef = useRef<'left' | 'right' | null>(null);
    const dragStartXRef = useRef(0);
    const initialWindowStartRef = useRef(0);
    const initialWindowSizeRef = useRef(0);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, type: 'drag' | 'resize', handle?: 'left' | 'right') => {
        e.stopPropagation();
        if (!navigationChartRef.current) return;
        if (type === 'drag') {
            isDraggingRef.current = true;
        } else if (handle) {
            isResizingRef.current = handle;
        }
        dragStartXRef.current = e.clientX;
        initialWindowStartRef.current = windowStart;
        initialWindowSizeRef.current = windowSize;
        windowSelectorRef.current?.classList.add('grabbing');
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current && !isResizingRef.current) return;
        if (!navigationChartRef.current) return;

        const navChartWidth = navigationChartRef.current.offsetWidth;
        const totalPoints = fullDataLength;
        const dx = e.clientX - dragStartXRef.current;
        const dIndex = Math.round((dx / navChartWidth) * totalPoints);

        if (isDraggingRef.current) {
            const newStart = Math.max(0, Math.min(initialWindowStartRef.current + dIndex, totalPoints - windowSize));
            setWindowStart(newStart);
        } else if (isResizingRef.current) {
            if (isResizingRef.current === 'left') {
                const newStart = Math.max(0, Math.min(initialWindowStartRef.current + dIndex, initialWindowStartRef.current + initialWindowSizeRef.current - 200));
                const newSize = initialWindowStartRef.current + initialWindowSizeRef.current - newStart;
                setWindowStart(newStart);
                setWindowSize(newSize);
            } else {
                const newSize = Math.max(200, Math.min(initialWindowSizeRef.current + dIndex, totalPoints - windowStart));
                setWindowSize(newSize);
            }
        }
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
        isResizingRef.current = null;
        windowSelectorRef.current?.classList.remove('grabbing');
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [fullDataLength, windowSize]);

    return {
        windowStart,
        windowSize,
        navigationChartRef,
        windowSelectorRef,
        handleMouseDown,
    };
};
