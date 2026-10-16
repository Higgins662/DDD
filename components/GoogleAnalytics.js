import Script from "next/script";

// Google Analytics 4 (gtag.js). Loads after the page becomes interactive so it
// never slows down the first paint. Next.js tracks client-side page changes
// through GA4's enhanced measurement ("page changes based on browser history").
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-1C7C7WSHV2";

export default function GoogleAnalytics() {
  if (!GA_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
