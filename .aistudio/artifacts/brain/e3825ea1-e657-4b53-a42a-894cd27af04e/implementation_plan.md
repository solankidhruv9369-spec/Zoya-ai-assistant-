# Implementation Plan: In-App Floating Web Browser Tab for Zoya

## Problem Statement
When Zoya attempts to open a website or new tab (e.g., via voice commands like "Open YouTube", "Open Google", or tool actions `openWebsite` / `openApplication`), the app previously attempted `window.open(url, "_blank")`. Inside sandboxed browser environments and without direct synchronous user gestures, browsers block popups completely, causing the request to fail or do nothing.

As selected by the user, Zoya will now open websites in an **interactive in-app floating web browser tab** directly within Zoya's interface.

---

## Proposed Changes

### 1. In-App Floating Browser Component (`src/components/InAppBrowserModal.tsx`)
Create a modern, floating browser window featuring:
- **Header & Navigation Bar**:
  - Window controls: Minimize, Maximize / Restore, and Close.
  - Navigation controls: Reload / Refresh, Back / Forward state (where supported).
  - URL input & status bar: Shows the active protocol (`https://`), domain name, and allows manual URL entry or search.
  - Tab header with favicon & page title indicator.
- **Embedded Web View**:
  - Secure sandboxed iframe container for rendering external and internal web targets.
  - Embedding Fallback / Escape Hatch: If a website enforces strict `X-Frame-Options: SAMEORIGIN` or `Content-Security-Policy: frame-ancestors 'none'` (like Google Search or YouTube main domain), the browser will detect or provide a one-click banner ("Open in External Tab" link with explicit user click) along with embedded-friendly targets (e.g. YouTube embed URLs, Wikipedia, DuckDuckGo, news feeds, web apps).
- **Floating & Responsive Layout**:
  - Can be dragged/docked or maximized to fill the viewport without disrupting Zoya's voice or chat session.
  - Minimized floating pill so users can resume listening to Zoya while keeping the tab accessible.

### 2. Integration in `src/App.tsx`
- **State Management**:
  - Add `activeBrowserTab: { isOpen: boolean; url: string; title: string; isMinimized: boolean }` state.
- **Tool Call Handling**:
  - Update `openWebsite` and `openApplication` tool handlers in `handleToolCall` to set `activeBrowserTab` with the requested URL instead of calling `window.open`.
  - Provide audio/voice feedback from Zoya: e.g., *"Maine aapke liye [Website Name] Zoya ke floating browser me khol diya hai."*
- **Action Feed & Chat Links**:
  - Any links or website actions clicked inside chat cards or suggestions will route directly into the floating browser tab.

---

## Verification Plan

### Automated Build & Syntax Checks
- Run `lint_applet` to check for TypeScript errors and broken imports.
- Run `compile_applet` to ensure Vite compiles the frontend cleanly.

### Manual & Functional Tests
1. **Voice Command / Tool Call**:
   - Speak or trigger "Open Wikipedia" or "Open Google" or "Open YouTube".
   - Verify that Zoya triggers `openWebsite` and immediately pops up the floating browser tab inside the app without any popup blocked alerts.
2. **Tab Controls**:
   - Test reload button, URL entry bar, minimize to floating pill, maximize to full canvas, and close button.
   - Test the external tab fallback button (`<a target="_blank">`) for sites with strict frame blocking.
3. **Voice Continuity**:
   - Verify Zoya can continue speaking or listening while the floating tab is active.
