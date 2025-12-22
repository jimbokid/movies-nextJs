'use client';

import { useEffect, useRef } from 'react';

type Star = { x: number; y: number; speed: number; size: number };
type Lightning = { active: boolean; timer: number; intensity: number };

export type PixelCarCanvasProps = {
    running: boolean;
    width?: number;
    height?: number;
    density?: 'low' | 'high';
};

const BASE_WIDTH = 200;
const BASE_HEIGHT = 112;

function drawCar(ctx: CanvasRenderingContext2D, tick: number) {
    const bounce = Math.sin(tick / 10) * 1.5;
    const baseX = 84;
    const baseY = 70 + bounce;

    ctx.fillStyle = '#0c0c14';
    ctx.fillRect(baseX, baseY, 40, 18);
    ctx.fillStyle = '#2de1f2';
    ctx.fillRect(baseX + 4, baseY + 4, 32, 9);
    ctx.fillStyle = '#8ef3ff';
    ctx.fillRect(baseX + 8, baseY + 6, 24, 6);
    ctx.fillStyle = '#ff7cf1';
    ctx.fillRect(baseX - 4, baseY + 6, 6, 6);
    ctx.fillRect(baseX + 40, baseY + 6, 6, 6);

    // Neon trail
    ctx.fillStyle = 'rgba(45,225,242,0.45)';
    ctx.fillRect(baseX - 14, baseY + 7, 10, 4);
    ctx.fillStyle = 'rgba(255,124,241,0.35)';
    ctx.fillRect(baseX - 10, baseY + 10, 12, 3);

    // Wheels
    ctx.fillStyle = '#111';
    ctx.fillRect(baseX + 6, baseY + 16, 8, 6);
    ctx.fillRect(baseX + 28, baseY + 16, 8, 6);
    ctx.fillStyle = '#c3dafe';
    ctx.fillRect(baseX + 8, baseY + 18, 4, 2);
    ctx.fillRect(baseX + 30, baseY + 18, 4, 2);
}

function drawRoad(ctx: CanvasRenderingContext2D, tick: number) {
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 82, BASE_WIDTH, 30);

    ctx.fillStyle = '#11111a';
    ctx.beginPath();
    ctx.moveTo(0, 82);
    ctx.lineTo(BASE_WIDTH / 2 - 26, BASE_HEIGHT);
    ctx.lineTo(BASE_WIDTH / 2 + 26, BASE_HEIGHT);
    ctx.lineTo(BASE_WIDTH, 82);
    ctx.fill();

    const dashCount = 8;
    for (let i = 0; i < dashCount; i += 1) {
        const offset = ((tick / 2 + i * 30) % (BASE_WIDTH + 30)) - 30;
        ctx.fillStyle = i % 2 === 0 ? '#7c3aed' : '#a855f7';
        ctx.fillRect(offset, 94, 16, 3);
    }
}

function drawStars(ctx: CanvasRenderingContext2D, stars: Star[]) {
    stars.forEach(star => {
        ctx.fillStyle = '#b3e7ff';
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
}

function updateStars(stars: Star[]) {
    stars.forEach(star => {
        star.x -= star.speed;
        if (star.x < -star.size) {
            star.x = BASE_WIDTH + Math.random() * 10;
            star.y = Math.random() * 70;
            star.speed = 0.4 + Math.random() * 0.8;
            star.size = Math.random() > 0.85 ? 2 : 1;
        }
    });
}

function drawLightning(ctx: CanvasRenderingContext2D, lightning: Lightning) {
    if (!lightning.active) return;
    ctx.fillStyle = `rgba(173,216,255,${lightning.intensity})`;
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    lightning.timer -= 1;
    lightning.intensity *= 0.9;
    if (lightning.timer <= 0 || lightning.intensity < 0.02) {
        lightning.active = false;
    }
}

export default function PixelCarCanvas({
    running,
    width = 420,
    height = 240,
    density = 'high',
}: PixelCarCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return undefined;

        canvas.width = BASE_WIDTH;
        canvas.height = BASE_HEIGHT;
        ctx.imageSmoothingEnabled = false;

        const stars: Star[] = Array.from({
            length: density === 'high' ? 80 : 60,
        }).map(() => ({
            x: Math.random() * BASE_WIDTH,
            y: Math.random() * 70,
            speed: 0.4 + Math.random() * 0.8,
            size: Math.random() > 0.85 ? 2 : 1,
        }));

        const lightning: Lightning = { active: false, intensity: 0, timer: 0 };
        let tick = 0;

        const loop = () => {
            if (!running) return;
            tick += 1;
            ctx.fillStyle = '#05030a';
            ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

            updateStars(stars);
            drawStars(ctx, stars);
            drawRoad(ctx, tick);
            drawCar(ctx, tick);

            if (!lightning.active && Math.random() < 0.003) {
                lightning.active = true;
                lightning.intensity = 0.14;
                lightning.timer = 10;
            }
            drawLightning(ctx, lightning);

            animationRef.current = requestAnimationFrame(loop);
        };

        if (running) {
            animationRef.current = requestAnimationFrame(loop);
        }

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [density, running]);

    useEffect(() => {
        if (!running && animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    }, [running]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width,
                height,
                imageRendering: 'pixelated',
            }}
            aria-hidden
        />
    );
}
