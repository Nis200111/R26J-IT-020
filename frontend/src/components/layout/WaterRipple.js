"use client";

import { useEffect, useRef } from "react";

export default function WaterRipple({ imageUrl, className, children }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = container.offsetWidth;
    let height = container.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    img.src = imageUrl;
    img.crossOrigin = "anonymous";

    let rippleData;
    let lastRippleData;
    let textureData;
    let outputData;
    let size;

    const initRipples = () => {
      size = width * height;
      rippleData = new Int32Array(size).fill(0);
      lastRippleData = new Int32Array(size).fill(0);
    };

    let rafId;

    img.onload = () => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      const imgAspect = img.width / img.height;
      const canvasAspect = width / height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgAspect > canvasAspect) {
        drawHeight = height;
        drawWidth = height * imgAspect;
        offsetX = -(drawWidth - width) / 2;
        offsetY = 0;
      } else {
        drawWidth = width;
        drawHeight = width / imgAspect;
        offsetX = 0;
        offsetY = -(drawHeight - height) / 2;
      }

      tempCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      textureData = tempCtx.getImageData(0, 0, width, height).data;
      outputData = ctx.createImageData(width, height);
      initRipples();
      animate();
    };

    const animate = () => {
      ctx.putImageData(updateRipples(), 0, 0);
      rafId = requestAnimationFrame(animate);
    };

    const updateRipples = () => {
      let i = width;
      const length = size - width;

      while (i < length) {
        let val =
          ((lastRippleData[i - 1] +
            lastRippleData[i + 1] +
            lastRippleData[i - width] +
            lastRippleData[i + width]) >>
            1) -
          rippleData[i];

        val -= val >> 5;
        rippleData[i] = val;

        const x = i % width;
        const y = Math.floor(i / width);

        const xOffset = (rippleData[i - 1] - rippleData[i + 1]) >> 3;
        const yOffset = (rippleData[i - width] - rippleData[i + width]) >> 3;

        let xSource = x + xOffset;
        let ySource = y + yOffset;

        if (xSource < 0) xSource = 0;
        if (xSource >= width) xSource = width - 1;
        if (ySource < 0) ySource = 0;
        if (ySource >= height) ySource = height - 1;

        const sourceIndex = (xSource + ySource * width) * 4;
        const targetIndex = i * 4;

        outputData.data[targetIndex] = textureData[sourceIndex];
        outputData.data[targetIndex + 1] = textureData[sourceIndex + 1];
        outputData.data[targetIndex + 2] = textureData[sourceIndex + 2];
        outputData.data[targetIndex + 3] = 255;

        i++;
      }

      const temp = lastRippleData;
      lastRippleData = rippleData;
      rippleData = temp;

      return outputData;
    };

    const dropAt = (x, y, radius, strength) => {
      for (let j = y - radius; j < y + radius; j++) {
        for (let i = x - radius; i < x + radius; i++) {
          if (i >= 0 && i < width && j >= 0 && j < height) {
            lastRippleData[j * width + i] += strength;
          }
        }
      }
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);
      dropAt(x, y, 2, 128);
    };

    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [imageUrl]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className || ""}`}>
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
