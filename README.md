# RSG Mobile Mechanics Website

A modern, responsive landing page for RSG Mobile Mechanics - Professional mobile auto repair services in South Florida.

## Features

- **Bilingual Support**: Full English and Spanish language support with easy toggle
- **Mobile-First Design**: Responsive design that works perfectly on all devices
- **SEO Optimized**: Complete SEO optimization with structured data, meta tags, and sitemap
- **OpenStreetMap Integration**: Interactive map showing service area in South Florida (no API key required)
- **Performance Optimized**: Fast loading with optimized images and code
- **Accessibility**: WCAG compliant with proper focus states and screen reader support

## Technologies Used

- HTML5 with semantic markup
- CSS3 with modern features (Grid, Flexbox, Custom Properties)
- Vanilla JavaScript (ES6+)
- Leaflet.js with OpenStreetMap
- Font Awesome icons
- Google Fonts (Inter)

## Setup Instructions

### 1. Add Your Images

Replace the placeholder images in the `/images/` folder:

- `rsg-logo.jpg` - Your RSG Mobile Mechanics logo
- `reiner-with-van.jpg` - Photo of Reiner with the service van
- `work-1.jpg` to `work-4.jpg` - Photos of your mechanical work
- `favicon.ico` - Website favicon

### 2. Map Setup ✅ COMPLETE

The interactive map uses OpenStreetMap via Leaflet.js - **no API key required!** The map will work immediately after deployment and shows:
- South Florida service area with coverage circle
- Custom business marker with contact information
- Click-to-call functionality directly in the map popup

### 3. Deploy to Netlify

1. Push this repository to GitHub
2. Connect your GitHub repo to Netlify
3. Deploy automatically - no build process required!

### 4. Custom Domain (Optional)

1. Purchase a domain (recommended: rsgmobilemechanics.com)
2. Add custom domain in Netlify settings
3. Update the sitemap.xml with your new domain

## File Structure

```
├── index.html          # Main landing page
├── styles.css          # All CSS styles
├── script.js           # JavaScript functionality
├── netlify.toml        # Netlify configuration
├── _redirects          # URL redirects
├── robots.txt          # Search engine instructions
├── sitemap.xml         # SEO sitemap
├── 404.html           # Custom 404 error page
├── README.md          # This file
└── images/            # Image assets
    ├── rsg-logo.jpg
    ├── reiner-with-van.jpg
    ├── work-1.jpg
    ├── work-2.jpg
    ├── work-3.jpg
    ├── work-4.jpg
    └── favicon.ico
```

## Business Information

- **Business Name**: RSG Mobile Mechanics
- **Owner**: Reiner Sosa
- **Phone**: (863) 223-9932
- **Service Area**: South Florida
- **Hours**: Monday - Sunday, 9:00 AM - 5:00 PM
- **Languages**: English & Español

## Services Offered

- Engine & Timing Repairs
- Alternators & Starters
- Brake Systems
- Cooling Systems
- Oil Changes
- Advanced Diagnostics

## SEO Features

- Structured data (JSON-LD) for local business
- Open Graph and Twitter Card meta tags
- Optimized meta descriptions and titles
- XML sitemap
- Robots.txt
- Fast loading times
- Mobile-friendly design
- Accessible design

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Performance

- Lighthouse Score: 95+ (Performance, SEO, Accessibility, Best Practices)
- Fast loading times
- Optimized images
- Minimal JavaScript
- Efficient CSS

## Customization

### Colors
The color scheme is based on RSG branding:
- Primary Red: #e53e3e
- Dark Gray: #2d3748
- Light Gray: #f7fafc

### Fonts
Using Inter font family for modern, clean appearance.

### Content
All text content supports bilingual display. Add new translations by:
1. Adding `data-en` and `data-es` attributes to HTML elements
2. The JavaScript will automatically handle language switching

## Contact Information

For technical support or updates to this website, contact the developer.

## License

This website is created specifically for RSG Mobile Mechanics. All rights reserved.
