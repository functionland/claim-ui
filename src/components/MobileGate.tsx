"use client"

import React from "react"

function isProbablyMobileDevice() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false
  }

  // Check User Agent for mobile indicators
  const ua = navigator.userAgent.toLowerCase()
  const mobileUA = (
    ua.includes("mobi") ||
    ua.includes("android") ||
    ua.includes("iphone") ||
    ua.includes("ipad") ||
    ua.includes("ipod") ||
    ua.includes("windows phone") ||
    ua.includes("iemobile")
  )

  // If UA clearly indicates mobile, return true
  if (mobileUA) return true

  // Check for touch support (but not the only factor)
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // Check for device orientation support (mobile-specific feature)
  const hasOrientationChange = 'orientation' in window

  // Check pointer type (coarse = touch, fine = mouse)
  const hasCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches

  // Check if screen is very small AND has mobile characteristics
  const screenWidth = window.screen.width
  const screenHeight = window.screen.height
  const isVerySmallScreen = Math.max(screenWidth, screenHeight) < 768

  // Mobile device if:
  // 1. Has mobile UA, OR
  // 2. Very small screen AND (has touch OR coarse pointer OR orientation change)
  // 3. Has coarse pointer AND touch support (likely mobile even on larger screens)
  
  if (isVerySmallScreen && (hasTouch || hasCoarsePointer || hasOrientationChange)) {
    return true
  }

  if (hasCoarsePointer && hasTouch && hasOrientationChange) {
    return true
  }

  return false
}

export const MobileGate: React.FC = () => {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    try {
      setIsMobile(isProbablyMobileDevice())
    } catch {
      // If detection fails, do nothing and allow access
      setIsMobile(false)
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
