/**
 * ╔══════════════════════════════════════════════════╗
 * ║        CENTRALIZED THEME CONFIGURATION          ║
 * ╠══════════════════════════════════════════════════╣
 * ║  Edit these values to change colors across      ║
 * ║  ALL pages. The root layout injects these as    ║
 * ║  CSS variables, and every component references  ║
 * ║  them via var(--name) so changes propagate      ║
 * ║  automatically.                                 ║
 * ╚══════════════════════════════════════════════════╝
 *
 * All values must be valid CSS color values:
 *   - Hex:  '#3e2723'
 *   - RGBA: 'rgba(255,255,255,0.7)'
 *   - Named: 'white', 'transparent'
 */

export const theme = {
  // ─── Sidebar (Wooden Frame) ──────────────────────
  sidebar: {
    bg: '#286f25',                              // Main sidebar background
    border: '#2c1810',                          // Border color & active item bg
    borderFaint: 'rgba(44,24,16,0.4)',          // Faint border (hover states)
    text: '#ffffff',                            // Primary text
    textSecondary: 'rgba(255,255,255,0.7)',     // Secondary text
    textTertiary: 'rgba(255,255,255,0.6)',      // Tertiary / muted text
    hover: '#4e3429',                           // Expand button hover
    activeBorder: 'rgba(255,255,255,0.2)',      // Active item border
  },

  // ─── Page (Chalkboard) ───────────────────────────
  page: {
    bg: '#0a1f18',                              // Main page background
    cardBg: '#0d281e',                          // Card / panel background
    cardBgTranslucent: 'rgba(13,40,30,0.9)',    // Translucent card (navbars)
    cardBorder: '#3e2723',                      // Card border color
  },

  // ─── Accent (Chalk Colors) ──────────────────────
  accent: {
    color: '#34d399',                           // Primary accent (emerald-400)
    hover: '#10b981',                           // Accent hover (emerald-500)
    bg: 'rgba(16,185,129,0.1)',                 // Accent background tint
    border: 'rgba(16,185,129,0.2)',             // Accent border
    muted: '#6ee7b7',                           // Muted accent (emerald-300)
    dark: 'rgba(6,78,59,0.3)',                  // Dark accent overlay
  },

  // ─── Buttons ─────────────────────────────────────
  button: {
    primaryBg: '#10b981',                       // Primary button bg
    primaryHover: '#34d399',                    // Primary hover
    primaryText: '#0d281e',                     // Primary button text
    primaryShadow: '#065f46',                   // Primary 3D shadow
    dangerBg: 'rgba(239,68,68,0.1)',            // Danger button bg
    dangerHover: 'rgba(239,68,68,0.2)',         // Danger hover
    dangerText: '#f87171',                      // Danger text
    dangerBorder: 'rgba(239,68,68,0.2)',        // Danger border
  },

  // ─── Status Badges ──────────────────────────────
  status: {
    activeBg: 'rgba(6,78,59,0.3)',              // Active badge bg
    activeText: '#6ee7b7',                      // Active badge text
    draftBg: 'rgba(100,116,139,0.2)',           // Draft badge bg
    draftText: '#cbd5e1',                       // Draft badge text
    draftBorder: 'rgba(100,116,139,0.3)',       // Draft badge border
  },

  // ─── Progress Bar ────────────────────────────────
  progress: {
    bg: 'rgba(0,0,0,0.2)',                      // Track background
    from: '#ffffff',                            // Gradient start
    to: '#e2e8f0',                              // Gradient end
    icon: '#facc15',                            // Zap icon color
  },
};

/**
 * Generates CSS custom property declarations from theme config.
 * Called by the root layout to inject theme as CSS variables.
 */
export function getThemeCSSVariables(): string {
  return `:root {
    --sidebar-bg: ${theme.sidebar.bg};
    --sidebar-border: ${theme.sidebar.border};
    --sidebar-border-faint: ${theme.sidebar.borderFaint};
    --sidebar-text: ${theme.sidebar.text};
    --sidebar-text-secondary: ${theme.sidebar.textSecondary};
    --sidebar-text-tertiary: ${theme.sidebar.textTertiary};
    --sidebar-hover: ${theme.sidebar.hover};
    --sidebar-active-border: ${theme.sidebar.activeBorder};

    --page-bg: ${theme.page.bg};
    --card-bg: ${theme.page.cardBg};
    --card-bg-translucent: ${theme.page.cardBgTranslucent};
    --card-border: ${theme.page.cardBorder};

    --accent: ${theme.accent.color};
    --accent-hover: ${theme.accent.hover};
    --accent-bg: ${theme.accent.bg};
    --accent-border: ${theme.accent.border};
    --accent-muted: ${theme.accent.muted};
    --accent-dark: ${theme.accent.dark};

    --btn-primary-bg: ${theme.button.primaryBg};
    --btn-primary-hover: ${theme.button.primaryHover};
    --btn-primary-text: ${theme.button.primaryText};
    --btn-primary-shadow: ${theme.button.primaryShadow};
    --btn-danger-bg: ${theme.button.dangerBg};
    --btn-danger-hover: ${theme.button.dangerHover};
    --btn-danger-text: ${theme.button.dangerText};
    --btn-danger-border: ${theme.button.dangerBorder};

    --status-active-bg: ${theme.status.activeBg};
    --status-active-text: ${theme.status.activeText};
    --status-draft-bg: ${theme.status.draftBg};
    --status-draft-text: ${theme.status.draftText};
    --status-draft-border: ${theme.status.draftBorder};

    --progress-bg: ${theme.progress.bg};
    --progress-from: ${theme.progress.from};
    --progress-to: ${theme.progress.to};
    --progress-icon: ${theme.progress.icon};
  }`;
}

export default theme;
