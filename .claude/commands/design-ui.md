# Design UI Component

## Purpose
Generate production-ready UI components using the Frontend Design plugin and GStack's design skills.

## When to Use
- Creating new pages or components
- Redesigning existing UI
- Building new features with UI

## Workflow

### Step 1: Explore Design Options
```bash
# Generate 4-6 mockup variants
/design-shotgun
```
Describe what you want and get visual options.

### Step 2: Generate Production HTML
```bash
# Turn mockup into production HTML
/design-html
```
Takes your chosen design and creates responsive, production-ready code.

### Step 3: Integration
The output will be:
- React components for Next.js
- Tailwind CSS styling
- Responsive across all breakpoints
- Accessible (WCAG compliant)

## Tayyibt Design Guidelines

### Color Palette
- Primary: Emerald green (#10B981) - represents growth and prosperity
- Secondary: Gold (#F59E0B) - represents prosperity
- Background: Clean white with subtle warm tones
- Text: Dark charcoal for readability

### Typography
- Headings: Clean, modern sans-serif
- Body: Highly readable, comfortable line height
- Arabic support: Proper RTL handling

### Layout Principles
- Mobile-first responsive design
- Generous whitespace
- Clear visual hierarchy
- Consistent spacing system

### Cultural Considerations
- Modest, family-friendly imagery
- Clean, professional aesthetic
- Privacy-conscious profile designs

## Usage Examples

```
You: Create a landing page hero section
/design-html

You: Design a user profile card component
/design-shotgun
# Then pick favorite and run /design-html

You: Build a matching dashboard interface
/design-html
```

## Output Location
Components are generated in:
- `web/src/components/`
- `web/src/features/*/components/`

---

*Part of GStack and Frontend Design integration*