import { useEffect } from "react";

interface AdSenseBannerProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdSenseBanner({ 
  adSlot, 
  adFormat = "auto", 
  className = "" 
}: AdSenseBannerProps) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Different ad formats for various placements
export function BannerAd({ className }: { className?: string }) {
  return (
    <AdSenseBanner
      adSlot="1234567890"
      adFormat="horizontal"
      className={className}
    />
  );
}

export function SquareAd({ className }: { className?: string }) {
  return (
    <AdSenseBanner
      adSlot="0987654321"
      adFormat="rectangle"
      className={className}
    />
  );
}

export function ResponsiveAd({ className }: { className?: string }) {
  return (
    <AdSenseBanner
      adSlot="1122334455"
      adFormat="auto"
      className={className}
    />
  );
}