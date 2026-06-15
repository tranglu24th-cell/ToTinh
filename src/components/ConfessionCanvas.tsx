/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';

interface ConfessionCanvasProps {
  activeCelebration: boolean;
  theme: 'pink' | 'dark';
}

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedY: number;
  swaySpeed: number;
  swayAmplitude: number;
  swayOffset: number;
  char: string;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  decay: number;
  gravity: number;
  friction: number;
  isHeart: boolean;
  rotation: number;
  rotationSpeed: number;
}

export default function ConfessionCanvas({ activeCelebration, theme }: ConfessionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Stable list of falling ambient items (hearts & petals)
  const heartsRef = useRef<HeartParticle[]>([]);
  // Floating array of fireworks fragments
  const sparksRef = useRef<SparkParticle[]>([]);
  // Store celebration state in ref to avoid re-binding the loop
  const celebrationRef = useRef(activeCelebration);
  const themeRef = useRef(theme);

  useEffect(() => {
    celebrationRef.current = activeCelebration;
  }, [activeCelebration]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Helper helper to draw a vector heart on Canvas
  const drawVectorHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y - size / 4);
    // Top-left curve
    ctx.bezierCurveTo(x - size / 1.5, y - size * 1.1, x - size * 1.2, y - size / 4, x, y + size * 1.1);
    // Top-right curve
    ctx.bezierCurveTo(x + size * 1.2, y - size / 4, x + size / 1.5, y - size * 1.1, x, y - size / 4);
    ctx.closePath();
    ctx.fill();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize falling hearts & cherry petals
    const numHearts = 25;
    const heartEmojisPink = ['❤️', '💖', '💕', '🌸', '💝', '💗', '💘', '💮'];
    const heartEmojisDark = ['💜', '💙', '✨', '💖', '🖤', '🌌', '⚡', '💫'];

    const initialHearts: HeartParticle[] = [];
    for (let i = 0; i < numHearts; i++) {
      const isPink = themeRef.current === 'pink';
      const list = isPink ? heartEmojisPink : heartEmojisDark;
      initialHearts.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * -window.innerHeight, // start above view
        size: Math.random() * 16 + 14, // 14px to 30px
        speedY: Math.random() * 1.2 + 0.8,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayAmplitude: Math.random() * 25 + 10,
        swayOffset: Math.random() * Math.PI * 2,
        char: list[Math.floor(Math.random() * list.length)],
        opacity: Math.random() * 0.4 + 0.4, // 0.4 to 0.8 opacity
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      });
    }
    heartsRef.current = initialHearts;

    // Trigger fireworks explosions (burst)
    const triggerBurst = (cx: number, cy: number, customCount?: number) => {
      const count = customCount || (40 + Math.floor(Math.random() * 30));
      const pinkSet = ['#FF0A54', '#FF477E', '#FF7096', '#FF85A1', '#FF99AC', '#F72585', '#FFF3B0', '#FFEA00'];
      const darkSet = ['#00F5D4', '#7B2CBF', '#9D4EDD', '#E0A1FF', '#3A0CA3', '#4CC9F0', '#F72585', '#FFEA00'];
      
      const set = themeRef.current === 'pink' ? pinkSet : darkSet;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 7;
        const color = set[Math.floor(Math.random() * set.length)];
        const isHeart = Math.random() > 0.4; // 60% standard sparks, 40% flying hearts!

        sparksRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - (Math.random() * 1.5), // slight upward pressure
          color,
          alpha: 1,
          size: isHeart ? Math.random() * 5 + 6 : Math.random() * 3 + 2,
          decay: 0.008 + Math.random() * 0.012,
          gravity: 0.07,
          friction: 0.965,
          isHeart,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.08,
        });
      }
    };

    let frameId: number;
    let autoFireTimer = 0;

    // Primary Render Loop
    const render = () => {
      // Clear with soft alpha trail in celebration mode for magical tail glows!
      if (celebrationRef.current) {
        ctx.fillStyle = themeRef.current === 'pink' ? 'rgba(255, 241, 242, 0.22)' : 'rgba(9, 6, 15, 0.22)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // 1. Draw and Update falling hearts/petals background layer
      heartsRef.current.forEach((heart) => {
        // Fall down
        heart.y += heart.speedY;
        heart.swayOffset += heart.swaySpeed;
        heart.rotation += heart.rotationSpeed;

        const currentX = heart.x + Math.sin(heart.swayOffset) * heart.swayAmplitude;

        // If theme changed midway, update icon characters dynamically
        const isPink = themeRef.current === 'pink';
        const list = isPink ? heartEmojisPink : heartEmojisDark;
        if (!list.includes(heart.char)) {
          heart.char = list[Math.floor(Math.random() * list.length)];
        }

        ctx.save();
        ctx.translate(currentX, heart.y);
        ctx.rotate(heart.rotation);
        ctx.globalAlpha = heart.opacity;
        ctx.font = `${heart.size}px "Quicksand", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(heart.char, 0, 0);
        ctx.restore();

        // Reset to top when going off screen
        if (heart.y > canvas.height + 30) {
          heart.y = -30;
          heart.x = Math.random() * canvas.width;
          heart.speedY = Math.random() * 1.2 + 0.8;
          heart.opacity = Math.random() * 0.4 + 0.4;
        }
      });

      // 2. Celebration: Firework explosions
      if (celebrationRef.current) {
        autoFireTimer++;
        // Spawn automatic explosion every 25 frames
        if (autoFireTimer % 35 === 0) {
          const rx = 100 + Math.random() * (canvas.width - 200);
          const ry = 100 + Math.random() * (canvas.height - 300);
          triggerBurst(rx, ry);
        }
      }

      // 3. Update & render firework spark particles
      const activeSparks = sparksRef.current;
      for (let i = activeSparks.length - 1; i >= 0; i--) {
        const spark = activeSparks[i];
        
        spark.vx *= spark.friction;
        spark.vy *= spark.friction;
        spark.vy += spark.gravity;
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.alpha -= spark.decay;
        spark.rotation += spark.rotationSpeed;

        if (spark.alpha <= 0) {
          activeSparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = spark.alpha;
        ctx.fillStyle = spark.color;

        if (spark.isHeart) {
          ctx.translate(spark.x, spark.y);
          ctx.rotate(spark.rotation);
          drawVectorHeart(ctx, 0, 0, spark.size);
        } else {
          // Standard circular sparkle trails with dynamic glow
          ctx.beginPath();
          ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
          ctx.shadowBlur = 10;
          ctx.shadowColor = spark.color;
          ctx.fill();
        }
        ctx.restore();
      }

      frameId = requestAnimationFrame(render);
    };

    render();

    // Custom mouse/finger click listener for responsive explosion feedback
    const handleCanvasClick = (e: MouseEvent) => {
      if (celebrationRef.current) {
        triggerBurst(e.clientX, e.clientY, 35);
      }
    };

    const handleCanvasTouch = (e: TouchEvent) => {
      if (celebrationRef.current && e.touches.length > 0) {
        triggerBurst(e.touches[0].clientX, e.touches[0].clientY, 35);
      }
    };

    window.addEventListener('click', handleCanvasClick);
    window.addEventListener('touchstart', handleCanvasTouch);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('touchstart', handleCanvasTouch);
    };
  }, []);

  return (
    <canvas
      id="confession-canvas font-sans"
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
    />
  );
}
