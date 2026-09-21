import React, { useEffect, useRef, useState, useCallback } from 'react';

const TOTAL_FRAMES = 240;
const FRAME_WIDTH = 1280;
const FRAME_HEIGHT = 720;

const getFrameUrl = (index: number) => {
  const paddedIndex = String(Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(index)))).padStart(6, '0');
  return `/frames/frame_${paddedIndex}.jpg`;
};

export const FrameSequence: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const currentInterpolatedFrameRef = useRef<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Render a specific frame to canvas with aspect-ratio cover at maximum quality
  const renderFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High quality canvas settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const clampedIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frameIndex)));

    // Look for exact frame or nearest loaded frame
    let img = imagesRef.current.get(clampedIndex);
    if (!img || !img.complete || img.naturalWidth === 0) {
      let minDistance = Infinity;
      let nearestImg: HTMLImageElement | null = null;
      for (const [idx, loadedImg] of imagesRef.current.entries()) {
        if (loadedImg.complete && loadedImg.naturalWidth > 0) {
          const dist = Math.abs(idx - clampedIndex);
          if (dist < minDistance) {
            minDistance = dist;
            nearestImg = loadedImg;
            if (dist <= 1) break;
          }
        }
      }
      img = nearestImg || undefined;
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    if (canvasWidth === 0 || canvasHeight === 0) return;

    // Calculate aspect ratio cover
    const hRatio = canvasWidth / FRAME_WIDTH;
    const vRatio = canvasHeight / FRAME_HEIGHT;
    const ratio = Math.max(hRatio, vRatio);

    const drawWidth = FRAME_WIDTH * ratio;
    const drawHeight = FRAME_HEIGHT * ratio;
    const drawX = (canvasWidth - drawWidth) / 2;
    const drawY = (canvasHeight - drawHeight) / 2;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    currentFrameRef.current = clampedIndex;
  }, []);

  // Update canvas size matching viewport and devicePixelRatio
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    renderFrame(currentInterpolatedFrameRef.current);
  }, [renderFrame]);

  // Preloading images with immediate Frame 0 paint
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const loadSingleImage = (index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        if (imagesRef.current.has(index)) {
          resolve(imagesRef.current.get(index)!);
          return;
        }
        const img = new Image();
        img.src = getFrameUrl(index);
        img.onload = () => {
          imagesRef.current.set(index, img);
          resolve(img);
        };
        img.onerror = () => {
          resolve(img);
        };
      });
    };

    // 1. Immediately load Frame 0 so visual appears in under 50ms with zero wait
    loadSingleImage(0).then(() => {
      setIsLoaded(true);
      updateCanvasSize();
      renderFrame(0);

      if (prefersReducedMotion) {
        renderFrame(40);
        return;
      }

      // 2. Preload keyframes across the 240-frame sequence (every 4th frame)
      const keyframes: number[] = [];
      for (let i = 0; i < TOTAL_FRAMES; i += 4) {
        keyframes.push(i);
      }
      if (!keyframes.includes(TOTAL_FRAMES - 1)) {
        keyframes.push(TOTAL_FRAMES - 1);
      }

      Promise.all(keyframes.map(loadSingleImage)).then(() => {
        // 3. Incrementally load remaining frames in small non-blocking batches
        const remaining: number[] = [];
        for (let i = 0; i < TOTAL_FRAMES; i++) {
          if (!imagesRef.current.has(i)) {
            remaining.push(i);
          }
        }

        let offset = 0;
        const loadBatch = () => {
          const batch = remaining.slice(offset, offset + 12);
          if (batch.length === 0) return;
          Promise.all(batch.map(loadSingleImage)).then(() => {
            offset += 12;
            if (offset < remaining.length) {
              setTimeout(loadBatch, 25);
            }
          });
        };
        loadBatch();
      });
    });

    const handleResize = () => {
      updateCanvasSize();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [renderFrame, updateCanvasSize]);

  // Continuous buttery smooth scrubbing loop with requestAnimationFrame
  useEffect(() => {
    let animId: number;

    const smoothTick = () => {
      const diff = targetFrameRef.current - currentInterpolatedFrameRef.current;
      if (Math.abs(diff) > 0.04) {
        // Fluid spring lerp damping for organic motion
        currentInterpolatedFrameRef.current += diff * 0.18;
        renderFrame(currentInterpolatedFrameRef.current);
      }
      animId = requestAnimationFrame(smoothTick);
    };

    animId = requestAnimationFrame(smoothTick);
    return () => cancelAnimationFrame(animId);
  }, [renderFrame]);

  // Scroll event listener updating target frame
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));
      targetFrameRef.current = progress * (TOTAL_FRAMES - 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#07030d]">
      {/* Dynamic 240-Frame High-Definition Canvas (Zero Whitewash, 100% Crisp) */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          filter: 'contrast(1.1) brightness(1.04) saturate(1.15)',
        }}
      />

      {/* Subtle Cinematic Vignette Framing (No White Tint) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(7,3,13,0.65)_100%)] pointer-events-none" />
    </div>
  );
};
