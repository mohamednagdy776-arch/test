# 🎨 Color System & Design Guide

## Core Palette

| Token Name         | Hex       | Preview | Role                  |
|--------------------|-----------|---------|----------------------|
| `--color-navy`     | `#213448` | 🟦 Dark Navy       | Primary / Deepest    |
| `--color-slate`    | `#547792` | 🔵 Slate Blue      | Secondary / Mid-tone |
| `--color-mist`     | `#94B4C1` | 🩵 Dusty Mist      | Accent / Light Blue  |
| `--color-sand`     | `#EAE0CF` | 🟫 Warm Sand       | Background / Neutral |

## Extended Palette (Complementary Additions)

These colors are derived to fill gaps in the system (pure white, dark text, interactive states, warnings, success, and error).

| Token Name           | Hex       | Role                          |
|----------------------|-----------|-------------------------------|
| `--color-white`      | `#FDFAF5` | Lightest surface / cards      |
| `--color-deep-navy`  | `#131F2E` | Darkest text / footer BG      |
| `--color-fog`        | `#C8D8DF` | Subtle borders / dividers     |
| `--color-warm-gray`  | `#BFB9AD` | Muted text / placeholders     |
| `--color-success`    | `#4A8C6F` | Success states / badges       |
| `--color-warning`    | `#C9923A` | Warnings / alerts             |
| `--color-error`      | `#B05252` | Errors / destructive actions  |
| `--color-highlight`  | `#D4E8EE` | Hover tints / selection BG    |

---

## CSS Variables (Add to `:root`)

```css
:root {
  /* Core Palette */
  --color-navy:       #213448;
  --color-slate:      #547792;
  --color-mist:       #94B4C1;
  --color-sand:       #EAE0CF;

  /* Extended Palette */
  --color-white:      #FDFAF5;
  --color-deep-navy:  #131F2E;
  --color-fog:        #C8D8DF;
  --color-warm-gray:  #BFB9AD;
  --color-success:    #4A8C6F;
  --color-warning:    #C9923A;
  --color-error:      #B05252;
  --color-highlight:  #D4E8EE;
}
```

---

## Usage Map by Component

### 🌐 Global / Layout

| Element              | Color Token           | Hex       | Notes                                      |
|----------------------|-----------------------|-----------|--------------------------------------------|
| Page background      | `--color-sand`        | `#EAE0CF` | Warm, calm base for the whole site         |
| Dark section BG      | `--color-navy`        | `#213448` | Hero sections, footers, sidebars           |
| Card / panel BG      | `--color-white`       | `#FDFAF5` | Post cards, modals, dropdowns              |
| Dividers / borders   | `--color-fog`         | `#C8D8DF` | Horizontal rules, card outlines            |
| Overlay / scrim      | `--color-deep-navy` @ 60% opacity | `#131F2E99` | Modals backdrop, image overlays |

---

### 🔤 Typography

| Text Type            | Color Token           | Hex       | Notes                                      |
|----------------------|-----------------------|-----------|--------------------------------------------|
| Primary headings     | `--color-navy`        | `#213448` | H1–H3, post titles                         |
| Body text            | `--color-deep-navy`   | `#131F2E` | Paragraph text, descriptions               |
| Secondary / captions | `--color-slate`       | `#547792` | Timestamps, author names, meta info        |
| Muted / placeholder  | `--color-warm-gray`   | `#BFB9AD` | Input placeholders, disabled labels        |
| Links (default)      | `--color-slate`       | `#547792` | In-text hyperlinks                         |
| Links (hover)        | `--color-navy`        | `#213448` | On hover, darken link                      |
| Text on dark BG      | `--color-sand`        | `#EAE0CF` | Any text placed over `--color-navy`        |
| Light text on dark   | `--color-mist`        | `#94B4C1` | Subtitles/captions on dark sections        |

---

### 🧭 Navigation Bar

| Element              | Color Token           | Hex       | Notes                                      |
|----------------------|-----------------------|-----------|--------------------------------------------|
| Navbar background    | `--color-navy`        | `#213448` | Sticky top bar                             |
| Logo / brand text    | `--color-white`       | `#FDFAF5` |                                            |
| Nav links            | `--color-mist`        | `#94B4C1` | Default nav link color                     |
| Nav link hover       | `--color-sand`        | `#EAE0CF` | On hover                                   |
| Active nav item      | `--color-sand`        | `#EAE0CF` | Underline or bold                          |
| Mobile menu BG       | `--color-deep-navy`   | `#131F2E` | Hamburger dropdown                         |
| Search bar BG        | `--color-slate` @ 30% | `#54779240`| Semi-transparent search field in nav      |

---

### 🔘 Buttons

| Variant              | Background            | Text              | Border            | Hover BG          |
|----------------------|-----------------------|-------------------|-------------------|-------------------|
| **Primary**          | `--color-navy`        | `--color-white`   | none              | `--color-deep-navy` |
| **Secondary**        | `--color-mist`        | `--color-navy`    | none              | `--color-slate`   |
| **Outline**          | transparent           | `--color-navy`    | `--color-navy`    | `--color-sand`    |
| **Ghost**            | transparent           | `--color-slate`   | none              | `--color-highlight` |
| **Danger**           | `--color-error`       | `--color-white`   | none              | `#8F3C3C`         |
| **Disabled**         | `--color-fog`         | `--color-warm-gray` | none            | (no change)       |

---

### 🗂️ Cards (Posts / Feed Items)

| Element              | Color Token           | Notes                                      |
|----------------------|-----------------------|--------------------------------------------|
| Card background      | `--color-white`       | Main card surface                          |
| Card border          | `--color-fog`         | Subtle 1px border                          |
| Card shadow          | `--color-navy` @ 8%   | `box-shadow: 0 2px 12px #21344814`         |
| Card title           | `--color-navy`        | Post/article heading                       |
| Card body text       | `--color-deep-navy`   | Content preview                            |
| Card meta (author/date) | `--color-slate`    | Secondary info                             |
| Card hover state     | `--color-highlight`   | Slight background tint on hover            |
| Card tag / badge     | `--color-mist`        | Category or topic chips                    |
| Tag text             | `--color-navy`        | Text inside tag chip                       |

---

### 🖼️ Hero / Banner Sections

| Element              | Color Token           | Notes                                      |
|----------------------|-----------------------|--------------------------------------------|
| Hero background      | `--color-navy`        | Full-width dark hero                       |
| Hero heading         | `--color-white`       | Large display text                         |
| Hero subheading      | `--color-mist`        | Subtitle or tagline                        |
| Hero CTA button      | Primary button style  | See buttons table above                    |
| Hero image overlay   | `--color-deep-navy` @ 50% | Darkens background images             |
| Gradient hero        | `#213448` → `#547792` | Linear gradient left-to-right              |

---

### 📝 Forms & Inputs

| Element              | Color Token           | Notes                                      |
|----------------------|-----------------------|--------------------------------------------|
| Input background     | `--color-white`       |                                            |
| Input border         | `--color-fog`         | Default border                             |
| Input border (focus) | `--color-slate`       | Highlight when focused                     |
| Input border (error) | `--color-error`       | Validation error state                     |
| Input text           | `--color-deep-navy`   |                                            |
| Placeholder text     | `--color-warm-gray`   |                                            |
| Label text           | `--color-navy`        |                                            |
| Helper / hint text   | `--color-slate`       | Small text below input                     |
| Error message text   | `--color-error`       |                                            |
| Checkbox / radio     | `--color-slate`       | Checked state color                        |
| Toggle (on)          | `--color-slate`       |                                            |
| Toggle (off)         | `--color-warm-gray`   |                                            |

---

### 💬 Comments & Threads

| Element              | Color Token           | Notes                                      |
|----------------------|-----------------------|--------------------------------------------|
| Comment bubble BG    | `--color-highlight`   | Slightly tinted background                 |
| Reply indent bar     | `--color-mist`        | Left border on nested replies              |
| Comment author name  | `--color-navy`        | Bold username                              |
| Comment timestamp    | `--color-warm-gray`   | Small muted time                           |
| Comment body text    | `--color-deep-navy`   |                                            |
| Like / react button  | `--color-slate`       | Default icon color                         |
| Like (active)        | `--color-error`       | Red heart when liked                       |
| Comment input BG     | `--color-white`       |                                            |

---

### 👤 User Profile

| Element              | Color Token           | Notes                                      |
|----------------------|-----------------------|--------------------------------------------|
| Profile header BG    | `--color-navy`        | Cover photo fallback color                 |
| Avatar border        | `--color-mist`        | Ring around profile picture                |
| Username / display name | `--color-navy`     |                                            |
| Bio text             | `--color-deep-navy`   |                                            |
| Stats (followers etc.)| `--color-slate`      | Counts and labels                          |
| Follow button        | Primary button style  |                                            |
| Following (state)    | Outline button style  |                                            |

---

### 🔔 Notifications

| Element              | Color Token           | Notes                                      |
|----------------------|-----------------------|--------------------------------------------|
| Notification badge   | `--color-error`       | Red dot / count bubble on bell icon        |
| Notification item BG (unread) | `--color-highlight` | Tinted row for unread items      |
| Notification item BG (read) | `--color-white`  | Default row                             |
| Notification icon    | `--color-slate`       |                                            |
| Notification text    | `--color-deep-navy`   |                                            |
| Notification time    | `--color-warm-gray`   |                                            |

---

### 📊 Sidebar / Widgets

| Element              | Color Token           | Notes                                      |
|----------------------|-----------------------|--------------------------------------------|
| Sidebar background   | `--color-white`       | Or `--color-sand` for softer look          |
| Widget card BG       | `--color-white`       |                                            |
| Widget heading       | `--color-navy`        |                                            |
| Trending tag chips   | `--color-mist`        | Background                                 |
| Trending tag text    | `--color-navy`        |                                            |
| Section divider      | `--color-fog`         |                                            |

---

### 🦶 Footer

| Element              | Color Token           | Notes                                      |
|----------------------|-----------------------|--------------------------------------------|
| Footer background    | `--color-deep-navy`   | Darkest shade for strong close             |
| Footer headings      | `--color-sand`        |                                            |
| Footer links         | `--color-mist`        |                                            |
| Footer link hover    | `--color-white`       |                                            |
| Footer copyright     | `--color-warm-gray`   | Small muted text                           |
| Footer divider       | `--color-slate` @ 30% | Subtle line                                |

---

### ✅ Status & Feedback States

| State      | Background          | Text / Icon         | Usage                       |
|------------|---------------------|---------------------|-----------------------------|
| Success    | `--color-success` @ 15% | `--color-success` | Post published, saved     |
| Warning    | `--color-warning` @ 15% | `--color-warning` | Incomplete profile, etc.  |
| Error      | `--color-error` @ 15%   | `--color-error`   | Failed action, form error  |
| Info       | `--color-highlight`     | `--color-slate`   | Tips, hints, general info  |

---

## Light / Dark Mode Strategy

This palette is naturally suited for a **light-mode-first** design. For dark mode:

| Light Token          | Dark Mode Swap         |
|----------------------|------------------------|
| `--color-sand`       | `--color-deep-navy`    |
| `--color-white`      | `--color-navy`         |
| `--color-navy`       | `--color-sand`         |
| `--color-deep-navy`  | `--color-white`        |
| `--color-fog`        | `--color-slate` @ 40%  |

---

## Color Relationships Summary

```
DARK END ──────────────────────────────────────────── LIGHT END

#131F2E   →   #213448   →   #547792   →   #94B4C1   →   #C8D8DF   →   #EAE0CF   →   #FDFAF5
Deep Navy     Navy          Slate         Mist           Fog           Sand           White

↑ Footers       ↑ Headers     ↑ UI Mid     ↑ Accents     ↑ Borders    ↑ Page BG     ↑ Cards
  Dark BGs        Navbar        Links        Chips          Dividers     Sections      Surfaces
```

---

## Quick Reference Cheat Sheet

| Where you are             | Background            | Primary Text        | Accent              |
|---------------------------|-----------------------|---------------------|---------------------|
| Page (default)            | `#EAE0CF` sand        | `#131F2E` deep navy | `#547792` slate     |
| Cards / panels            | `#FDFAF5` white       | `#131F2E` deep navy | `#94B4C1` mist      |
| Navbar / Hero             | `#213448` navy        | `#FDFAF5` white     | `#94B4C1` mist      |
| Footer                    | `#131F2E` deep navy   | `#EAE0CF` sand      | `#94B4C1` mist      |
| Buttons (primary)         | `#213448` navy        | `#FDFAF5` white     | —                   |
| Buttons (secondary)       | `#94B4C1` mist        | `#213448` navy      | —                   |
