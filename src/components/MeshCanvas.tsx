import { useEffect, useRef } from 'react';

export default function MeshCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let W = 0, H = 0;
        let points: any[] = [];
        let animId: number;
        let mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };
        let lastMouse = { x: -1000, y: -1000 };

        const handleMouseMove = (e: MouseEvent) => {
            lastMouse.x = mouse.x;
            lastMouse.y = mouse.y;
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            
            // Calculate smoothed velocity vector for wind
            mouse.vx = (mouse.x - lastMouse.x) * 0.1;
            mouse.vy = (mouse.y - lastMouse.y) * 0.1;
        };

        const handleMouseOut = () => {
            mouse.x = -1000;
            mouse.y = -1000;
            mouse.vx = 0;
            mouse.vy = 0;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseOut);

        function resize() {
            if (!canvas) return;
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }

        function initPoints() {
            points = [];
            const count = Math.floor((W * H) / 18000);
            for (let i = 0; i < count; i++) {
                points.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    baseVx: (Math.random() - 0.5) * 0.2,
                    baseVy: (Math.random() - 0.5) * 0.2,
                    vx: 0,
                    vy: 0,
                    r: 1 + Math.random() * 1.5,
                    z: Math.random()
                });
            }
        }

        function buildTriangles() {
            const tris = [];
            for (let i = 0; i < points.length; i++) {
                const dists = [];
                for (let j = 0; j < points.length; j++) {
                    if (i === j) continue;
                    const dX = points[i].x - points[j].x;
                    const dY = points[i].y - points[j].y;
                    if (Math.abs(dX) < 250 && Math.abs(dY) < 250) {
                        dists.push({ j, d: Math.hypot(dX, dY) });
                    }
                }
                dists.sort((a, b) => a.d - b.d);
                const maxEdge = Math.min(W, H) * 0.25;
                const neighbors = dists.slice(0, 3).filter(n => n.d < maxEdge);

                for (let k = 0; k + 1 < neighbors.length; k++) {
                    const a = points[i], b = points[neighbors[k].j], c = points[neighbors[k + 1].j];
                    tris.push([a, b, c]);
                }
            }
            return tris;
        }

        function draw() {
            if (!ctx) return;
            ctx.clearRect(0, 0, W, H);

            // Friction to slow down mouse velocity memory
            mouse.vx *= 0.95;
            mouse.vy *= 0.95;

            points.forEach(p => {
                const distToMouse = Math.hypot(p.x - mouse.x, p.y - mouse.y);
                
                // Add soft global sway/wind from mouse movement
                p.vx += mouse.vx * 0.005 * (1 - p.z);
                p.vy += mouse.vy * 0.005 * (1 - p.z);

                if (distToMouse < 350) {
                    const force = (350 - distToMouse) / 350;
                    // Magnetic Attraction (pull toward mouse instead of repelling)
                    p.vx += (mouse.x - p.x) * force * 0.0006;
                    p.vy += (mouse.y - p.y) * force * 0.0006;
                    p.intensity = force;
                } else {
                    p.intensity = 0;
                }

                p.vx = (p.vx * 0.92) + (p.baseVx * 0.08);
                p.vy = (p.vy * 0.92) + (p.baseVy * 0.08);
                p.x += p.vx * (1 + p.z);
                p.y += p.vy * (1 + p.z);

                if (p.x < -100) p.x = W + 100;
                if (p.x > W + 100) p.x = -100;
                if (p.y < -100) p.y = H + 100;
                if (p.y > H + 100) p.y = -100;
            });

            const tris = buildTriangles();

            tris.forEach(([a, b, c]) => {
                const maxDist = Math.max(
                    Math.hypot(a.x - b.x, a.y - b.y),
                    Math.hypot(b.x - c.x, b.y - c.y),
                    Math.hypot(c.x - a.x, c.y - a.y)
                );

                if (maxDist < 250) {
                    const alpha = (1 - maxDist / 250) * 0.2;
                    const combinedIntensity = (a.intensity + b.intensity + c.intensity) / 3 || 0;

                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.lineTo(c.x, c.y);
                    ctx.closePath();

                    if (combinedIntensity > 0) {
                        ctx.fillStyle = `rgba(58, 111, 188, ${alpha + combinedIntensity * 0.25})`;
                        ctx.strokeStyle = `rgba(58, 111, 188, ${alpha * 2.5 + combinedIntensity * 0.5})`;
                    } else {
                        ctx.fillStyle = `rgba(74, 94, 122, ${alpha * 0.5})`;
                        ctx.strokeStyle = `rgba(74, 94, 122, ${alpha * 1.5})`;
                    }

                    ctx.lineWidth = 1.0;
                    ctx.stroke();
                    ctx.fill();
                }
            });

            points.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r + (p.intensity * 3), 0, Math.PI * 2);

                if (p.intensity > 0) {
                    ctx.fillStyle = `rgba(58, 111, 188, ${0.6 + p.intensity * 0.4})`;
                    ctx.shadowBlur = 15 * p.intensity;
                    ctx.shadowColor = '#3a6fbc';
                } else {
                    ctx.fillStyle = `rgba(74, 94, 122, ${0.4 + p.z * 0.5})`;
                    ctx.shadowBlur = 0;
                }

                ctx.fill();
            });

            animId = requestAnimationFrame(draw);
        }

        window.addEventListener('resize', resize);
        resize();
        initPoints();
        draw();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseOut);
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animId);
        };
    }, []);

    return (
        <>
            <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-[0] opacity-70" />
            <div className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none z-[0]" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(226, 235, 245, 0.4) 100%)' }} />
        </>
    );
}
