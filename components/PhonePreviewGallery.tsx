"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Horizontal App Store–style phone strip for projects with multiple
 * preview screenshots. Scrolls on narrow viewports; peeks the next
 * frame so the gallery is discoverable without chrome.
 */
export default function PhonePreviewGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  if (images.length === 0) return null;

  return (
    <div className="border border-steel/40 bg-panel/40 transition-colors duration-300 group-hover:border-phosphor">
      <div className="-mx-6 overflow-x-auto px-6 py-12 [scrollbar-width:thin]">
        <ul className="mx-auto flex w-max snap-x snap-mandatory gap-5 sm:gap-6">
          {images.map((src, index) => (
            <li
              key={src}
              className="w-[13.5rem] shrink-0 snap-center sm:w-[15rem]"
            >
              <div className="rounded-[2rem] border border-steel bg-panel p-2 shadow-[0_0_0_1px_rgba(11,11,10,0.6)_inset]">
                <div className="relative aspect-[9/19.5] w-full overflow-hidden rounded-[1.6rem] bg-ink">
                  {failed[src] ? (
                    <div className="flex h-full w-full items-center justify-center px-4 text-center">
                      <span className="mono-label text-paper/60">{name}</span>
                    </div>
                  ) : (
                    <Image
                      src={src}
                      alt={`${name} app preview ${index + 1} of ${images.length}`}
                      fill
                      sizes="(min-width: 640px) 15rem, 13.5rem"
                      className="object-cover"
                      onError={() =>
                        setFailed((prev) => ({ ...prev, [src]: true }))
                      }
                    />
                  )}
                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-[0.55rem] z-10 h-[1.1rem] w-[4.5rem] -translate-x-1/2 rounded-full bg-ink"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p className="mono-label border-t border-steel/30 px-6 py-3 text-center text-paper/40">
        swipe to preview · {images.length} screens
      </p>
    </div>
  );
}
