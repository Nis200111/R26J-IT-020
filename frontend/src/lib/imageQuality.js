/**
 * In-browser photo quality checks, run before the image is sent to the model.
 *
 * Your page already showed an "Image Quality Guidelines" panel with four ticks
 * that were always green and checked nothing. These are the real versions. They
 * run on a canvas in the user's browser, cost a few milliseconds, and need no
 * libraries.
 *
 * Why this matters for your component specifically: a blurry or dark photo is
 * the most common cause of a low-confidence result, and telling the user that
 * before they wait for a prediction is more useful than a warning afterwards.
 */

const SAMPLE_SIZE = 256;

/** Variance of the Laplacian — the standard cheap sharpness measure. */
function laplacianVariance(gray, w, h) {
    const out = [];
    for (let y = 1; y < h - 1; y += 1) {
        for (let x = 1; x < w - 1; x += 1) {
            const i = y * w + x;
            const v =
                4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - w] - gray[i + w];
            out.push(v);
        }
    }
    if (!out.length) return 0;
    const mean = out.reduce((a, b) => a + b, 0) / out.length;
    return out.reduce((a, b) => a + (b - mean) ** 2, 0) / out.length;
}

/**
 * Analyse a File and return measurements plus per-check verdicts.
 * Resolves even on failure — a broken check must never block an upload.
 */
export function analyzeImage(file) {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            try {
                const scale = SAMPLE_SIZE / Math.max(img.width, img.height);
                const w = Math.max(2, Math.round(img.width * scale));
                const h = Math.max(2, Math.round(img.height * scale));

                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext("2d", { willReadFrequently: true });
                ctx.drawImage(img, 0, 0, w, h);

                const { data } = ctx.getImageData(0, 0, w, h);
                const gray = new Float32Array(w * h);
                let sum = 0;
                let greenish = 0;

                for (let p = 0; p < w * h; p += 1) {
                    const r = data[p * 4];
                    const g = data[p * 4 + 1];
                    const b = data[p * 4 + 2];
                    const l = 0.299 * r + 0.587 * g + 0.114 * b;
                    gray[p] = l;
                    sum += l;
                    if (g > r + 8 && g > b + 8) greenish += 1;
                }

                const brightness = sum / (w * h);
                const sharpness = laplacianVariance(gray, w, h);
                const plantFraction = greenish / (w * h);

                URL.revokeObjectURL(url);
                resolve(buildReport({
                    width: img.width,
                    height: img.height,
                    brightness,
                    sharpness,
                    plantFraction,
                    bytes: file.size,
                }));
            } catch {
                URL.revokeObjectURL(url);
                resolve(null);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(null);
        };

        img.src = url;
    });
}

/**
 * Downscale a File to a JPEG data URL. Used for the printable report, where a
 * blob URL would not survive being written into a new window, and where a full
 * 12 MB photo would be wasteful.
 */
export function downscaleToDataUrl(file, maxSize = 900, quality = 0.85) {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            try {
                const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
                const canvas = document.createElement("canvas");
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                URL.revokeObjectURL(url);
                resolve(canvas.toDataURL("image/jpeg", quality));
            } catch {
                URL.revokeObjectURL(url);
                resolve(null);
            }
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(null);
        };
        img.src = url;
    });
}

/**
 * Thresholds are deliberately lenient — a false warning that makes someone
 * retake a perfectly good photo is worse than letting a marginal one through.
 * Tune them once you have seen real uploads.
 */
function buildReport(m) {
    const checks = [
        {
            id: "resolution",
            label: "Image is large enough",
            ok: Math.min(m.width, m.height) >= 224,
            detail: `${m.width} × ${m.height} px`,
            hint: "The model works at 224 × 224. Below that, detail is lost before it even starts.",
        },
        {
            id: "sharpness",
            label: "Image focus is sharp",
            ok: m.sharpness >= 90,
            warn: m.sharpness >= 45 && m.sharpness < 90,
            detail: `sharpness ${Math.round(m.sharpness)}`,
            hint: "Hold the camera still and tap to focus on the leaf before shooting.",
        },
        {
            id: "lighting",
            label: "Lighting is usable",
            ok: m.brightness >= 55 && m.brightness <= 205,
            warn:
                (m.brightness >= 40 && m.brightness < 55) ||
                (m.brightness > 205 && m.brightness <= 225),
            detail:
                m.brightness < 55
                    ? `too dark (${Math.round(m.brightness)}/255)`
                    : m.brightness > 205
                        ? `too bright (${Math.round(m.brightness)}/255)`
                        : `brightness ${Math.round(m.brightness)}/255`,
            hint: "Shoot in open shade — direct sun blows out leaf texture, indoors is usually too dark.",
        },
        {
            id: "subject",
            label: "Plant fills the frame",
            ok: m.plantFraction >= 0.12,
            warn: m.plantFraction >= 0.05 && m.plantFraction < 0.12,
            detail: `${Math.round(m.plantFraction * 100)}% foliage`,
            hint: "Move closer, or place the specimen on a plain light sheet.",
        },
    ];

    const failed = checks.filter((c) => !c.ok && !c.warn);
    const warned = checks.filter((c) => c.warn);

    return {
        measurements: m,
        checks,
        verdict: failed.length ? "poor" : warned.length ? "fair" : "good",
        failed: failed.length,
        warned: warned.length,
    };
}
