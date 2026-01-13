# Theme System Guide - Event Registration Platform

## Overview

Each of the three frontend applications (Admin, Organizer, Attendee) now has a distinct, professional theme designed to reflect its purpose and user base. All themes are fully responsive with accurate breakpoints for real-world usage.

---

## 🎨 Theme Designs

### 1. Admin App - **Professional Corporate Theme**

**Color Palette:**
- **Primary:** Dark Navy (#1a2332) - Professional, authoritative
- **Accent:** Corporate Blue (#3b82f6) - Trustworthy, reliable
- **Background:** Light Gray (#f8fafc) - Clean, minimal
- **Sidebar:** Dark Navy with blue accents

**Design Philosophy:**
- Corporate and professional appearance
- Clean, minimal interface suitable for administrative tasks
- High contrast for data-heavy dashboards
- Professional typography and spacing

**Use Case:** System administrators managing the entire platform

---

### 2. Organizer App - **Energetic Creative Theme**

**Color Palette:**
- **Primary:** Vibrant Orange/Coral (#ff6b35) - Energetic, creative
- **Accent:** Warm Orange (#ffa726) - Warm, inviting
- **Background:** Warm Off-White (#fef9f7) - Soft, approachable
- **Sidebar:** Orange gradient with white text

**Design Philosophy:**
- Energetic and creative vibe perfect for event organizers
- Warm color palette creates enthusiasm
- Eye-catching gradients and shadows
- Friendly yet professional appearance

**Use Case:** Event organizers creating and managing events

---

### 3. Attendee App - **Friendly Modern Theme**

**Color Palette:**
- **Primary:** Modern Purple/Blue (#667eea) - Modern, friendly
- **Accent:** Vibrant Pink (#f093fb) - Playful, engaging
- **Background:** Soft Gray-Blue (#f7fafc) - Calm, inviting
- **Navbar:** White with purple gradient logo

**Design Philosophy:**
- Consumer-friendly and approachable
- Modern gradient designs
- Clean, easy-to-navigate interface
- Emphasis on simplicity and clarity

**Use Case:** End users browsing events and managing tickets

---

## 📱 Responsive Breakpoints

All three apps use consistent, real-world responsive breakpoints:

### Mobile First Approach

1. **Small Mobile:** 320px - 479px
   - Single column layouts
   - Simplified navigation (hamburger menu)
   - Touch-friendly targets (44px minimum)
   - Larger fonts for readability

2. **Large Mobile:** 480px - 767px
   - Optimized for portrait orientation
   - Collapsible sidebars
   - Stacked form elements

3. **Tablet:** 768px - 1023px
   - Two-column layouts where appropriate
   - Expanded navigation menus
   - Better use of horizontal space

4. **Desktop:** 1024px - 1279px
   - Full sidebar navigation
   - Multi-column grids
   - Hover effects enabled

5. **Large Desktop:** 1280px+
   - Maximum content width constraints (1400px)
   - Optimal spacing and readability
   - All interactive elements visible

---

## 🎯 Key Features

### Consistent Across All Themes:

1. **CSS Custom Properties (Variables)**
   - Centralized color system
   - Easy theme customization
   - Consistent spacing and typography

2. **Mobile Menu Support**
   - Hamburger menu on mobile/tablet
   - Smooth slide-in animations
   - Backdrop overlay for focus

3. **Touch-Friendly Design**
   - Minimum 44px touch targets (iOS/Android standards)
   - No zoom on input focus (prevents iOS zoom bug)
   - Appropriate spacing between clickable elements

4. **Accessibility**
   - High contrast ratios
   - Semantic HTML structure
   - Keyboard navigation support
   - Screen reader friendly

5. **Performance**
   - CSS transitions for smooth animations
   - Optimized shadows and effects
   - Minimal repaints/reflows

---

## 📂 File Structure

```
frontend/
├── admin-app/
│   └── src/
│       ├── styles/
│       │   └── theme.css          # Admin theme variables
│       ├── style.css              # Global styles + theme import
│       └── components/
│           └── Layout.css         # Themed layout styles
│
├── organizer-app/
│   └── src/
│       ├── styles/
│       │   └── theme.css          # Organizer theme variables
│       ├── style.css              # Global styles + theme import
│       └── components/
│           └── Layout.css         # Themed layout styles
│
└── attendee-app/
    └── src/
        ├── styles/
        │   └── theme.css          # Attendee theme variables
        ├── style.css              # Global styles + theme import
        └── components/
            └── Layout.css         # Themed layout styles
```

---

## 🚀 Usage

### Accessing Theme Variables

In any component CSS file, use the CSS variables:

```css
/* Admin App */
.my-component {
  background: var(--admin-primary);
  color: var(--admin-sidebar-text);
  padding: var(--admin-spacing-lg);
  border-radius: var(--admin-radius-md);
  box-shadow: var(--admin-shadow-md);
}

/* Organizer App */
.my-component {
  background: var(--org-primary);
  color: var(--org-sidebar-text);
  padding: var(--org-spacing-lg);
  border-radius: var(--org-radius-md);
  box-shadow: var(--org-shadow-md);
}

/* Attendee App */
.my-component {
  background: var(--attendee-primary);
  color: var(--attendee-sidebar-text);
  padding: var(--attendee-spacing-lg);
  border-radius: var(--attendee-radius-md);
  box-shadow: var(--attendee-shadow-md);
}
```

---

## 🎨 Color Variables Reference

### Admin App
- `--admin-primary`: #1a2332 (Dark Navy)
- `--admin-accent`: #3b82f6 (Corporate Blue)
- `--admin-success`: #10b981
- `--admin-error`: #ef4444

### Organizer App
- `--org-primary`: #ff6b35 (Vibrant Orange)
- `--org-accent`: #ffa726 (Warm Orange)
- `--org-success`: #27ae60
- `--org-error`: #e74c3c

### Attendee App
- `--attendee-primary`: #667eea (Modern Purple/Blue)
- `--attendee-accent`: #f093fb (Vibrant Pink)
- `--attendee-success`: #10b981
- `--attendee-error`: #ef4444

---

## 📱 Mobile Navigation

All three apps feature responsive mobile navigation:

- **Admin & Organizer:** Collapsible sidebar with overlay
- **Attendee:** Hamburger menu with dropdown navigation
- Smooth animations and transitions
- Touch-friendly controls (44px minimum)

---

## ✨ Best Practices

1. **Always use theme variables** instead of hardcoded colors
2. **Follow the spacing scale** (xs, sm, md, lg, xl, 2xl)
3. **Use appropriate breakpoints** for responsive design
4. **Maintain 44px minimum** for touch targets
5. **Test on real devices** for accurate responsive behavior

---

## 🔄 Updating Themes

To update a theme, modify the CSS variables in the respective `theme.css` file:

```css
/* frontend/admin-app/src/styles/theme.css */
:root {
  --admin-primary: #your-color;
  /* Update other variables as needed */
}
```

All components using these variables will automatically update.

---

## 🎯 Real-World Considerations

### Performance
- CSS variables are efficient and cached
- Minimal JavaScript for theme switching
- Optimized animations with hardware acceleration

### Accessibility
- WCAG AA contrast ratios maintained
- Keyboard navigation fully supported
- Screen reader optimized

### Cross-Browser
- Modern browser support (Chrome, Firefox, Safari, Edge)
- Graceful degradation for older browsers
- Vendor prefixes where needed

---

## 📝 Notes

- All themes are production-ready and tested
- Responsive breakpoints based on real-world device statistics
- Touch targets meet iOS and Android guidelines
- Font sizes prevent iOS zoom bug (minimum 16px on inputs)

---

**Last Updated:** 2026-01-10
**Version:** 1.0.0