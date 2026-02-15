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
  // ─── Sidebar (Forest) ────────────────────────────
  sidebar: {
    bg: '#0d4a3a',                              // Forest dark background
    border: '#064e3b',                          // Forest darker border
    borderFaint: 'rgba(6,78,59,0.4)',           // Forest faint border (hover states)
    text: '#ffffff',                            // Primary text
    textSecondary: 'rgba(255,255,255,0.7)',     // Secondary text
    textTertiary: 'rgba(255,255,255,0.6)',      // Tertiary / muted text
    hover: '#155e4d',                           // Forest hover
    activeBorder: 'rgba(76,221,176,0.3)',       // Mint active border
  },

  // ─── Page (Dark Forest) ───────────────────────────
  page: {
    bg: '#f0f4f1',                              // Dark forest background
    cardBg: '#064e3b',                          // Forest card background
    cardBgTranslucent: 'rgba(13,40,30,0.95)',   // Translucent forest (navbars)
    cardBorder: 'rgba(16,185,129,0.2)',         // Emerald tint border
  },

  // ─── Text (Light on Dark) ───────────────────────
  text: {
    heading: '#064e3b',                          // Forest green — page headings
    subheading: '#7a8a82',                       // Dark gray-green — page subtitles
    primary: '#f0f4f1',                         // Soft off-white — body text
    secondary: '#c8d5e0',                       // Light slate — descriptions, icons
    muted: '#94a3b8',                           // Slate-400 — labels, hints, disabled
    description: '#c8d5e0',                     // Light slate — paragraph descriptions
  },

  // ─── Accent (Mint & Emerald) ─────────────────────
  accent: {
    color: '#4cddb0',                           // Mint primary
    hover: '#2b9e7a',                           // Forest hover
    bg: 'rgba(76,221,176,0.1)',                 // Mint background tint
    border: 'rgba(76,221,176,0.2)',             // Mint border
    muted: '#6ee7b7',                           // Bright mint
    dark: 'rgba(13,74,58,0.15)',                // Forest dark overlay
  },

  // ─── Inputs ──────────────────────────────────────
  input: {
    bg: 'rgba(0,0,0,0.2)',                      // Dark translucent
    border: 'rgba(255,255,255,0.1)',            // Faint white
    borderDisabled: 'rgba(255,255,255,0.05)',   // Fainter white
    focusBorder: 'rgba(16,185,129,0.5)',        // Emerald focus
    text: '#ffffff',                            // White
    textDisabled: '#64748b',                    // Slate-500
    placeholder: '#64748b',                     // Slate-500
  },

  // ─── Buttons ─────────────────────────────────────
  button: {
    primaryBg: '#4cddb0',                       // Mint button bg
    primaryHover: '#2b9e7a',                    // Forest hover
    primaryText: '#ffffff',                     // White text on mint
    primaryShadow: '#064e3b',                   // Forest shadow
    secondaryBg: 'rgba(255,255,255,0.05)',      // Faint white
    secondaryHover: 'rgba(255,255,255,0.1)',    // Slightly brighter
    secondaryText: '#94a3b8',                   // Slate-400
    secondaryBorder: 'rgba(255,255,255,0.1)',   // Faint white
    dangerBg: 'rgba(239,68,68,0.1)',            // Danger button bg
    dangerHover: 'rgba(239,68,68,0.2)',         // Danger hover
    dangerText: '#f87171',                      // Red-400 (visible on dark)
    dangerBorder: 'rgba(239,68,68,0.2)',        // Danger border
  },

  // ─── Status Badges ──────────────────────────────
  status: {
    activeBg: 'rgba(76,221,176,0.15)',          // Mint active badge bg
    activeText: '#4cddb0',                      // Mint text (visible on dark)
    draftBg: 'rgba(148,163,184,0.1)',           // Slate tint
    draftText: '#94a3b8',                       // Slate-400
    draftBorder: 'rgba(148,163,184,0.2)',       // Slate border
  },

  // ─── Progress Bar ────────────────────────────────
  progress: {
    bg: 'rgba(255,255,255,0.1)',                // Faint white track
    from: '#4cddb0',                            // Mint gradient start
    to: '#2b9e7a',                              // Forest gradient end
    icon: '#4cddb0',                            // Mint zap icon
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

    --text-heading: ${theme.text.heading};
    --text-subheading: ${theme.text.subheading};
    --text-primary: ${theme.text.primary};
    --text-secondary: ${theme.text.secondary};
    --text-muted: ${theme.text.muted};
    --text-description: ${theme.text.description};

    --accent: ${theme.accent.color};
    --accent-hover: ${theme.accent.hover};
    --accent-bg: ${theme.accent.bg};
    --accent-border: ${theme.accent.border};
    --accent-muted: ${theme.accent.muted};
    --accent-dark: ${theme.accent.dark};

    --input-bg: ${theme.input.bg};
    --input-border: ${theme.input.border};
    --input-border-disabled: ${theme.input.borderDisabled};
    --input-focus-border: ${theme.input.focusBorder};
    --input-text: ${theme.input.text};
    --input-text-disabled: ${theme.input.textDisabled};
    --input-placeholder: ${theme.input.placeholder};

    --btn-primary-bg: ${theme.button.primaryBg};
    --btn-primary-hover: ${theme.button.primaryHover};
    --btn-primary-text: ${theme.button.primaryText};
    --btn-primary-shadow: ${theme.button.primaryShadow};
    --btn-secondary-bg: ${theme.button.secondaryBg};
    --btn-secondary-hover: ${theme.button.secondaryHover};
    --btn-secondary-text: ${theme.button.secondaryText};
    --btn-secondary-border: ${theme.button.secondaryBorder};
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
