# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static personal blog website hosted on GitHub Pages. The site features a minimalist design inspired by Anthropic's aesthetic, with a focus on clean typography and user experience.

## Architecture

### Core Structure
- **Static HTML Site**: No build process or framework required
- **Pure CSS Styling**: Custom CSS with Inter font from Google Fonts
- **Vanilla JavaScript**: Minimal JS for interactivity (newsletter form, smooth scrolling, post creation)
- **GitHub Pages Hosting**: Direct deployment from repository

### File Organization
```
/
├── index.html           # Main landing page with blog post grid
├── styles.css          # Main stylesheet with Anthropic-inspired design
├── script.js           # Core JavaScript for site functionality
├── admin.html          # Admin panel for creating new blog posts
├── admin.css           # Admin-specific styles
├── admin.js            # Post creation and management logic
└── posts/              # Individual blog post HTML files
```

### Key Components

**Post System**:
- Each blog post is a standalone HTML file in `/posts/`
- Posts follow a consistent template with hero sections and styled content
- Admin panel (`admin.html`) provides a UI for creating new posts with proper formatting

**Design System**:
- Color palette: Beige backgrounds (#faf8f6), dark text, accent colors for categories
- Typography: Inter font with careful size hierarchy
- Card-based layout with subtle shadows and hover effects
- Responsive design with container constraints

**Admin Features**:
- Live preview of post as you write
- Auto-save to localStorage
- Export formatted HTML for new posts
- Category selection with color coding

## Development Commands

```bash
# Start local development server (Python 3)
python3 -m http.server 8000

# Or with Python 2
python -m SimpleHTTPServer 8000

# Then navigate to http://localhost:8000
```

## Deployment

The site auto-deploys via GitHub Pages when changes are pushed to the main branch. No build step required.

## Working with Posts

1. **Creating a new post**: Use `admin.html` to write and preview, then export the HTML
2. **Post structure**: Each post should include proper meta tags, hero section, and be placed in `/posts/`
3. **Updating index**: After adding a post, update `index.html` to include it in the posts grid

## CSS Architecture

The site uses a utility-first approach with semantic class names:
- `.container` for consistent max-width and padding
- `.post-card` for blog post previews
- `.hero-section` for page headers
- Color classes: `.green`, `.purple`, `.orange`, `.blue` for post categories