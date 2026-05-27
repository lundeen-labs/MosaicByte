# Frontend Source (src)

Core application code for the Mosaic Byte marketing site.

## Directory Structure

- `components/`: Reusable UI components.
    - `case-study/`: Components specific to MDX case study rendering.
    - `hero/`: Homepage and section hero components.
    - `layout/`: High-level layout components (Header, Footer, Navigation).
    - `ui/`: Design system primitives (Button, Card, Input, etc.).
- `routes/`: Page-level components mapped to wouter routes.
    - `Home.tsx`: Landing page.
    - `Work.tsx`: Portfolio index.
    - `WorkDetail.tsx`: Individual case study viewer.
    - `Contact.tsx`: Lead capture form.
    - `About.tsx`: Brand story.
- `lib/`: Domain logic and shared utilities.
    - `seo.tsx`: Metadata management component.
    - `seo-data.ts`: Site-wide SEO configuration.
    - `reduced-motion.ts`: Accessibility hooks for motion.
    - `utils.ts`: Standard helpers (cn, etc.).
- `content/`: Static data and UI copy.
    - `copy.ts`: Single source of truth for text across the site.
- `test/`: Frontend testing setup and shared mocks.
- `App.tsx`: Main application entry point and routing table.
- `main.tsx`: DOM mounting point.
- `index.css`: Global styles and Tailwind v4 imports.
