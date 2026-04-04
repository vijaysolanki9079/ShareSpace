import { useRef, useEffect } from "react";

interface UseImageSequenceProps {
  frameCount: number;
  imagePrefix: string;
  imageSuffix: string;
  fps?: number;
  startIndex?: number;
  loop?: boolean;
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

    const loadImages = async () => {
      const promises: Promise<void>[] = [];
      for (let i = 0; i < frameCount; i++) {
        const indexStr = i.toString().padStart(3, "0");
        const img = new Image();
        img.decoding = "async";
        const src = `${imagePrefix}${indexStr}${imageSuffix}`;
        img.src = src;
        imagesRef.current[i] = img;
        promises.push(
          new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }),
        );
      }
      await Promise.all(promises);
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
        const img = imagesRef.current[frameIndex];

        if (img?.complete && img.naturalWidth > 0) {
          drawCover(ctx, canvas, img);
        }

        if (frameIndex < frameCount - 1) {
          frameIndexRef.current = frameIndex + 1;
        } else if (loop) {
          frameIndexRef.current = 0;
        }

        lastTime = time;
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

    void loadImages().then(() => {
      syncCanvasSize();
      const first = imagesRef.current[frameIndexRef.current];
      if (first?.complete && first.naturalWidth > 0) {
        drawCover(ctx, canvas, first);
      }
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
  }, [frameCount, imagePrefix, imageSuffix, fps, loop, startIndex]);

  return canvasRef;
};
