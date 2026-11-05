"use client";

// One Google AdSense display unit (the "Banner-Ad" unit from the AdSense
// account). The AdSense library is loaded once per page by next/script; each
// slot asks it to fill the <ins> after the slot is on the page.
import Script from "next/script";
import { useEffect, useRef } from "react";

export const ADSENSE_CLIENT = "ca-pub-4874897311297165";

export default function AdSlot({ slot = "9983724153", label = "Advertisement" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    // Ask once per <ins>; AdSense marks filled slots with data-adsbygoogle-status.
    if (!el || el.getAttribute("data-adsbygoogle-status")) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers or an unapproved domain: leave the space empty.
    }
  }, []);

  return (
    <aside className="ad-slot" aria-label={label}>
      <Script
        id="adsbygoogle-lib"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <span className="ad-label">{label}</span>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
