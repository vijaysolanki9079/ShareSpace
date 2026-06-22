import { useRef, useEffect } from "react";

interface UseImageSequenceProps {
  frameCount: number;
  imagePrefix: string;
  imageSuffix: string;
  fps?: number;
  startIndex?: number;
  loop?: boolean;
  eagerFrameCount?: number;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
) {
  if (!img.naturalWidth || !img.naturalHeight || !canvas.width || !canvas.height) {
    return;
  }
  const hRatio = canvas.width / img.naturalWidth;
  const vRatio = canvas.height / img.naturalHeight;
  const ratio = Math.max(hRatio, vRatio);
  const dw = img.naturalWidth * ratio;
  const dh = img.naturalHeight * ratio;
  const offsetX = (canvas.width - dw) / 2;
  const offsetY = (canvas.height - dh) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, offsetX, offsetY, dw, dh);
}

export const useImageSequence = ({
  frameCount,
  imagePrefix,
  imageSuffix,
  fps = 30,
  startIndex = 0,
  loop = true,
  eagerFrameCount = 12,
}: UseImageSequenceProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef<number>(startIndex);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || frameCount <= 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    imagesRef.current = [];

    const isImageReady = (img: HTMLImageElement | undefined) =>
      Boolean(img?.complete && img.naturalWidth > 0);

    const createImage = (index: number, priority: "high" | "auto" = "auto") => {
      const indexStr = index.toString().padStart(3, "0");
      const img = new Image();
      img.decoding = "async";
      img.loading = "eager";
      img.setAttribute("fetchpriority", priority);
      img.src = `${imagePrefix}${indexStr}${imageSuffix}`;
      imagesRef.current[index] = img;
      return img;
    };

    const waitForImage = (img: HTMLImageElement) => {
      if (img.complete) return Promise.resolve();

      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    };

    const loadFrameRange = (from: number, to: number, priority: "high" | "auto" = "auto") => {
      for (let i = from; i < to; i++) {
        if (!imagesRef.current[i]) {
          createImage(i, priority);
        }
      }
    };

    const loadRemainingImages = () => {
      const eagerEnd = Math.min(frameCount, Math.max(startIndex + 1, eagerFrameCount));
      loadFrameRange(0, eagerEnd, "high");
      setTimeout(() => loadFrameRange(eagerEnd, frameCount), 100);
    };

    let lastTime = 0;
    const interval = 1000 / fps;
    let stopped = false;

    const syncCanvasSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = Math.max(1, Math.floor(parent.clientWidth));
      const h = Math.max(1, Math.floor(parent.clientHeight));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const render = (time: number) => {
      if (stopped) return;
      syncCanvasSize();

      if (time - lastTime > interval) {
        const frameIndex = frameIndexRef.current;
        const img = imagesRef.current[frameIndex] ?? createImage(frameIndex, frameIndex < eagerFrameCount ? "high" : "auto");

        if (isImageReady(img)) {
          drawCover(ctx, canvas, img);

          if (frameIndex < frameCount - 1) {
            frameIndexRef.current = frameIndex + 1;
          } else if (loop) {
            frameIndexRef.current = 0;
          }

          lastTime = time;
        }
      }

      if (!loop && frameIndexRef.current === frameCount - 1 && time - lastTime > interval) {
        return;
      }

      requestRef.current = requestAnimationFrame(render);
    };

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => syncCanvasSize())
        : null;

    if (canvas.parentElement) {
      ro?.observe(canvas.parentElement);
    }

    const firstFrame = createImage(startIndex, "high");

    void waitForImage(firstFrame).then(() => {
      if (stopped) return;

      syncCanvasSize();
      if (isImageReady(firstFrame)) {
        drawCover(ctx, canvas, firstFrame);
      }

      loadRemainingImages();
      requestRef.current = requestAnimationFrame(render);
    });

    const onWinResize = () => syncCanvasSize();
    window.addEventListener("resize", onWinResize);
    syncCanvasSize();

    return () => {
      stopped = true;
      ro?.disconnect();
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener("resize", onWinResize);
    };
  }, [eagerFrameCount, frameCount, imagePrefix, imageSuffix, fps, loop, startIndex]);

  return canvasRef;
};
