"use client";

import React, { useEffect, useRef } from 'react';

interface RealTimeChartProps {
    azData: number[];
}

const RealTimeChart = ({ azData }: RealTimeChartProps) => {
    const chartCanvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const drawChart = () => {
            const canvas = chartCanvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.clientWidth * dpr;
            canvas.height = canvas.clientHeight * dpr;
            ctx.scale(dpr, dpr);

            ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.moveTo(0, canvas.clientHeight / 2);
            ctx.lineTo(canvas.clientWidth, canvas.clientHeight / 2);
            ctx.stroke();

            if (azData.length > 1) {
                const visibleData = azData.slice(-200);
                const max = Math.max(...visibleData.map(a => Math.abs(a))) || 10;
                const scale = (canvas.clientHeight / 2) / (max * 1.2);

                ctx.strokeStyle = '#6EE7B7';
                ctx.lineWidth = 2;
                ctx.beginPath();

                visibleData.forEach((az, idx) => {
                    const x = (idx / (visibleData.length - 1)) * canvas.clientWidth;
                    const y = canvas.clientHeight / 2 - az * scale;
                    if (idx === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.stroke();
            }
        };

        const animate = () => {
            drawChart();
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [azData]);

    return (
        <canvas
            ref={chartCanvasRef}
            className="w-full h-full bg-gray-800 rounded-lg border border-gray-700"
        />
    );
};

export default RealTimeChart;
