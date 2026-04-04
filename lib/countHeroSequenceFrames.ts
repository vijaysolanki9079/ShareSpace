/**
 * Detect how many consecutive frames exist at `${prefix}000..${suffix}`, `${prefix}001..`, etc.
 * Used when NEXT_PUBLIC_HERO_SEQUENCE_FRAMES is not set but files exist under /public.
 */
export async function countHeroSequenceFrames(
  imagePrefix: string,
  imageSuffix: string,
  maxFrames = 300,
): Promise<number> {
  const frameUrl = (index: number) =>
    `${imagePrefix}${index.toString().padStart(3, "0")}${imageSuffix}`;

  const exists = async (index: number) => {
    const url = frameUrl(index);
    try {
      let res = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (res.ok) return true;
      if (res.status === 405 || res.status === 501) {
        res = await fetch(url, { method: "GET", cache: "no-store" });
        return res.ok;
      }
      return false;
    } catch {
      return false;
    }
  };

  if (!(await exists(0))) {
    return 0;
  }

  let lo = 0;
  let hi = maxFrames - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (await exists(mid)) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }

  return lo + 1;
}
