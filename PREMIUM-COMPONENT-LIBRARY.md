# ArielGo Premium Component Library
## World-Class UI System - Fresh & Bright Edition

This is your complete design system for creating world-class laundry delivery experiences with a fresh, modern aesthetic.

---

## 🎨 Color System

### Primary Palette (Sky Fresh)
```css
--color-sky: #0EA5E9;      /* Primary brand color */
--color-ocean: #14B8A6;    /* Secondary brand color */
--color-cyan: #06B6D4;     /* Accent color */
--color-lime: #84CC16;     /* Fresh accent */
```

### Status Colors
```css
--color-success: #10B981;    /* Completed states */
--color-warning: #F59E0B;    /* In progress */
--color-danger: #EF4444;     /* Errors/Issues */
```

### Gradients
```css
/* Primary Sky Gradient - Main brand */
--gradient-sky: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #14B8A6 100%);

/* Ocean Fresh Gradient - Alternative */
--gradient-ocean: linear-gradient(135deg, #14B8A6 0%, #06B6D4 50%, #0EA5E9 100%);

/* Sunrise Gradient - Alternative */
--gradient-sunrise: linear-gradient(135deg, #06B6D4 0%, #84CC16 50%, #F59E0B 100%);

/* Mesh Background - Animated (Light Theme) */
--gradient-mesh: radial-gradient(at 0% 0%, rgba(14, 165, 233, 0.08) 0px, transparent 50%),
                radial-gradient(at 100% 0%, rgba(6, 182, 212, 0.08) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(20, 184, 166, 0.08) 0px, transparent 50%),
                radial-gradient(at 0% 100%, rgba(132, 204, 22, 0.08) 0px, transparent 50%);
```

### Text Colors (Light Theme)
```css
--text-primary: #1F2937;     /* Main text */
--text-secondary: #6B7280;   /* Secondary text */
--text-tertiary: #9CA3AF;    /* Tertiary text */
```

---

## 📦 Component Library

### 1. **Glassmorphism Cards (Light Theme)**
The foundation of the premium UI.

```html
<div class="glass-card">
    <h3>Card Title</h3>
    <p>Card content goes here</p>
</div>
```

```css
.glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(14, 165, 233, 0.15);
    border-radius: 32px;
    padding: 3rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-card:hover {
    transform: translateY(-8px);
    border-color: rgba(14, 165, 233, 0.3);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}
```

---

### 2. **Premium Buttons**

#### Primary Button
```html
<button class="btn-premium-primary">
    Click Me
</button>
```

```css
.btn-premium-primary {
    background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #14B8A6 100%);
    color: white;
    padding: 1.25rem 2.5rem;
    border-radius: 16px;
    font-weight: 600;
    font-size: 1.125rem;
    border: none;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
}

.btn-premium-primary::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
}

.btn-premium-primary:hover::before {
    left: 100%;
}

.btn-premium-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                0 0 40px rgba(14, 165, 233, 0.15);
}
```

#### Ghost Button
```html
<button class="btn-premium-ghost">
    Click Me
</button>
```

```css
.btn-premium-ghost {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(8px);
    color: #0EA5E9;
    padding: 1.25rem 2.5rem;
    border-radius: 16px;
    font-weight: 600;
    font-size: 1.125rem;
    border: 1px solid rgba(14, 165, 233, 0.2);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-premium-ghost:hover {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(14, 165, 233, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

---

### 3. **Premium Form Inputs (Light Theme)**

```html
<div class="form-group-premium">
    <label for="email">Email Address</label>
    <input type="email" id="email" placeholder="you@example.com">
</div>
```

```css
.form-group-premium {
    margin-bottom: 1.5rem;
}

.form-group-premium label {
    display: block;
    margin-bottom: 0.75rem;
    font-weight: 600;
    color: #1F2937;
    font-size: 0.95rem;
}

.form-group-premium input,
.form-group-premium select,
.form-group-premium textarea {
    width: 100%;
    padding: 1.25rem 1.5rem;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(14, 165, 233, 0.2);
    border-radius: 16px;
    color: #1F2937;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.form-group-premium input:focus,
.form-group-premium select:focus,
.form-group-premium textarea:focus {
    outline: none;
    background: #FFFFFF;
    border-color: #0EA5E9;
    box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
}

.form-group-premium input::placeholder,
.form-group-premium textarea::placeholder {
    color: #9CA3AF;
}
```

---

### 4. **Stat Cards (Light Theme)**

```html
<div class="stat-card-premium">
    <div class="stat-number">24h</div>
    <div class="stat-label">Guaranteed Turnaround</div>
</div>
```

```css
.stat-card-premium {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(14, 165, 233, 0.15);
    border-radius: 24px;
    padding: 3rem 2rem;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
}

.stat-card-premium::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #14B8A6 100%);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.stat-card-premium:hover {
    transform: translateY(-8px);
    border-color: rgba(14, 165, 233, 0.3);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.stat-card-premium:hover::before {
    transform: scaleX(1);
}

.stat-number {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #14B8A6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
    margin-bottom: 0.75rem;
}

.stat-label {
    font-size: 1rem;
    color: #6B7280;
    font-weight: 500;
}
```

---

### 5. **Status Badges (Light Theme)**

```html
<span class="status-badge status-confirmed">Confirmed</span>
<span class="status-badge status-in-progress">In Progress</span>
<span class="status-badge status-completed">Completed</span>
```

```css
.status-badge {
    padding: 0.75rem 1.5rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.95rem;
    text-transform: capitalize;
    animation: pulse 2s ease-in-out infinite;
}

.status-confirmed {
    background: rgba(6, 182, 212, 0.1);
    color: #0284C7;
    border: 1px solid rgba(6, 182, 212, 0.2);
}

.status-in-progress {
    background: rgba(14, 165, 233, 0.1);
    color: #0EA5E9;
    border: 1px solid rgba(14, 165, 233, 0.2);
}

.status-completed {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
    border: 1px solid rgba(16, 185, 129, 0.2);
}
```

---

### 6. **Progress Tracker (Light Theme)**

```html
<div class="progress-tracker-premium">
    <div class="progress-line">
        <div class="progress-line-fill" style="width: 50%"></div>
    </div>
    <div class="progress-steps">
        <div class="step completed">
            <div class="step-circle">📝</div>
            <div class="step-label">Received</div>
        </div>
        <div class="step active">
            <div class="step-circle">✅</div>
            <div class="step-label">Confirmed</div>
        </div>
        <div class="step">
            <div class="step-circle">🧺</div>
            <div class="step-label">Processing</div>
        </div>
        <div class="step">
            <div class="step-circle">🚗</div>
            <div class="step-label">Delivered</div>
        </div>
    </div>
</div>
```

```css
.progress-tracker-premium {
    margin: 3rem 0;
    position: relative;
}

.progress-steps {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    position: relative;
}

.progress-line {
    position: absolute;
    top: 40px;
    left: 12.5%;
    right: 12.5%;
    height: 3px;
    background: rgba(14, 165, 233, 0.15);
    z-index: 0;
    border-radius: 2px;
}

.progress-line-fill {
    height: 100%;
    background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #14B8A6 100%);
    transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    border-radius: 2px;
    position: relative;
}

.progress-line-fill::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    background: #14B8A6;
    border-radius: 50%;
    box-shadow: 0 0 20px #14B8A6;
    animation: pulse 1.5s ease-in-out infinite;
}

.step {
    position: relative;
    text-align: center;
    z-index: 1;
}

.step-circle {
    width: 80px;
    height: 80px;
    margin: 0 auto 1rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    border: 2px solid rgba(14, 165, 233, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.step.active .step-circle {
    border-color: #0EA5E9;
    background: rgba(14, 165, 233, 0.1);
    transform: scale(1.1);
    box-shadow: 0 0 30px rgba(14, 165, 233, 0.2);
}

.step.completed .step-circle {
    border-color: #10B981;
    background: rgba(16, 185, 129, 0.1);
}

.step-label {
    font-weight: 600;
    font-size: 0.95rem;
    color: #9CA3AF;
}

.step.active .step-label,
.step.completed .step-label {
    color: #1F2937;
}
```

---

### 7. **Floating Navigation Bar (Light Theme)**

```html
<nav class="nav-premium">
    <div class="logo-premium">ArielGo</div>
    <ul class="nav-links-premium">
        <li><a href="#features">Features</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="/track.html">Track Order</a></li>
        <li><a href="#booking" class="btn-nav-cta">Book Now</a></li>
    </ul>
</nav>
```

```css
.nav-premium {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    width: calc(100% - 40px);
    max-width: 1400px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(14, 165, 233, 0.1);
    border-radius: 20px;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.nav-premium.scrolled {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.logo-premium {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.75rem;
    font-weight: 700;
    background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #14B8A6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
}

.nav-links-premium {
    display: flex;
    gap: 2.5rem;
    list-style: none;
    align-items: center;
}

.nav-links-premium a {
    text-decoration: none;
    color: #4B5563;
    font-weight: 500;
    font-size: 0.95rem;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    padding: 0.5rem 0;
}

.nav-links-premium a::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #14B8A6 100%);
    border-radius: 2px;
    transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-links-premium a:hover {
    color: #0EA5E9;
}

.nav-links-premium a:hover::before {
    width: 100%;
}
```

---

## 🎬 Animations

### Pulse Animation (Sky Blue)
```css
@keyframes pulse {
    0%, 100% {
        opacity: 1;
        box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7);
    }
    50% {
        opacity: 0.7;
        box-shadow: 0 0 0 10px rgba(14, 165, 233, 0);
    }
}
```

### Fade In Up
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(40px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in-up {
    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Gradient Flow (Sky Blue)
```css
@keyframes gradientFlow {
    0%, 100% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
}

.gradient-text-animated {
    background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #14B8A6 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientFlow 3s ease infinite;
}
```

---

## 🌊 Background Effects (Light Theme)

### Animated Gradient Mesh
```html
<div class="gradient-mesh-bg"></div>
<div class="grain-overlay"></div>
```

```css
.gradient-mesh-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    background: radial-gradient(at 0% 0%, rgba(14, 165, 233, 0.08) 0px, transparent 50%),
                radial-gradient(at 100% 0%, rgba(6, 182, 212, 0.08) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(20, 184, 166, 0.08) 0px, transparent 50%),
                radial-gradient(at 0% 100%, rgba(132, 204, 22, 0.08) 0px, transparent 50%);
    animation: meshMove 20s ease-in-out infinite;
}

.gradient-mesh-bg::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #E0F2FE 0%, #F0FDFA 100%);
    z-index: -1;
}

@keyframes meshMove {
    0%, 100% {
        background-position: 0% 0%, 100% 0%, 100% 100%, 0% 100%;
    }
    50% {
        background-position: 100% 100%, 0% 100%, 0% 0%, 100% 0%;
    }
}

.grain-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    opacity: 0.03;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}
```

---

## 📱 Responsive Design

### Mobile-First Breakpoints
```css
/* Mobile (default) */
/* < 768px */

/* Tablet */
@media (min-width: 768px) {
    /* Tablet styles */
}

/* Desktop */
@media (min-width: 1024px) {
    /* Desktop styles */
}

/* Large Desktop */
@media (min-width: 1440px) {
    /* Large desktop styles */
}
```

---

## 🎯 Usage Tips

1. **Always use the Sky Fresh color palette** - Sky Blue (#0EA5E9), Cyan (#06B6D4), Ocean Teal (#14B8A6), Lime (#84CC16)
2. **Light theme glassmorphism** - White backgrounds with subtle transparency
3. **Smooth animations** - Use `cubic-bezier(0.16, 1, 0.3, 1)` for all transitions
4. **Gradient backgrounds** - Always use the animated light gradient mesh
5. **Typography** - Space Grotesk for headings, Inter for body text
6. **Spacing** - Use multiples of 8px (0.5rem, 1rem, 1.5rem, 2rem, etc.)
7. **Border radius** - Cards: 32px, Buttons: 16px, Small elements: 12px
8. **Shadows** - Use the defined shadow variables for depth
9. **Contrast** - Dark text (#1F2937) on light backgrounds for readability
10. **Accessibility** - Ensure proper color contrast ratios (WCAG AA minimum)

---

## 🚀 Performance Tips

1. **GPU Acceleration** - Only animate `transform` and `opacity`
2. **Backdrop Filter** - Use sparingly, it's expensive
3. **Lazy Load** - Load particle systems and heavy animations on scroll
4. **Debounce** - Debounce scroll and resize events
5. **Minimize Repaints** - Use `will-change` for animated elements
6. **Optimize Images** - Use WebP format with fallbacks
7. **Critical CSS** - Inline critical CSS for above-the-fold content
8. **Preload Fonts** - Preload Google Fonts for faster rendering

---

## 🌟 Fresh vs. Dark Theme Comparison

### Fresh Theme (Current - Light)
- Background: White with light blue gradients (#E0F2FE → #F0FDFA)
- Colors: Sky Blue, Cyan, Ocean Teal, Lime
- Text: Dark gray (#1F2937) for maximum readability
- Cards: Light with transparency (rgba(255, 255, 255, 0.7))
- Perfect for: Clean, professional, approachable feel

### Dark Theme (Legacy - Available in -dark.html files)
- Background: Dark with purple gradients (#0a0a0a → #1a1a2e)
- Colors: Indigo, Violet, Fuchsia
- Text: White for contrast
- Cards: Dark with transparency (rgba(255, 255, 255, 0.03))
- Perfect for: Premium, luxurious, dramatic feel

---

**Built with fresh vibes - Making laundry delivery premium since 2025** ✨
