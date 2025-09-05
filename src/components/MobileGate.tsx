"use client"

import React from "react"

function isProbablyMobileUA(ua: string) {
  const needle = ua.toLowerCase()
  return (
    needle.includes("mobi") ||
    needle.includes("android") ||
    needle.includes("iphone") ||
    needle.includes("ipad") ||
    needle.includes("ipod") ||
    needle.includes("windows phone") ||
    needle.includes("iemobile")
  )
}

export const MobileGate: React.FC = () => {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    try {
      const ua = typeof navigator !== "undefined" ? navigator.userAgent : ""
      const byUA = isProbablyMobileUA(ua)
      const byViewport = typeof window !== "undefined" ? Math.min(window.innerWidth, window.innerHeight) <= 820 : false
      setIsMobile(byUA || byViewport)
    } catch {
      // If detection fails, do nothing and allow access
    }
  }, [])

  if (!isMobile) return null

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#0b0e11",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 28, lineHeight: 1.2, marginBottom: 12, fontWeight: 700 }}>
          Desktop Only
        </h1>
        <p style={{ opacity: 0.9, fontSize: 16 }}>
          This portal is only accessible on desktop browsers. Please open this page on a desktop or laptop computer.
        </p>
      </div>
    </div>
  )
}
