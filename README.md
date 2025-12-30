# Employee Communication ROI Calculator

A time-first ROI calculator that helps prospects understand how much time is wasted on employee communication and how much time can be recovered by moving to a text-first approach.

## Setup

1. Clone or download this repository
2. Open `config.js` and replace `YOUR_ZAPIER_WEBHOOK_URL_HERE` with your actual Zapier webhook URL
3. Open `index.html` in a browser or deploy to a web server

## Deployment

### GitHub Pages

1. Push this repository to GitHub
2. Go to repository Settings → Pages
3. Select the branch (usually `main` or `master`)
4. Select the folder (usually `/root`)
5. Save and your site will be available at `https://yourusername.github.io/repository-name`

### Other Static Hosting

This is a static site with no build step required. You can deploy to:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static hosting service

Simply upload all files to your hosting provider.

## Configuration

Edit `config.js` to set your Zapier webhook URL for lead capture.

## Features

- Real-time ROI calculations based on time savings
- Responsive design (mobile, tablet, desktop)
- Iframe-embeddable
- Lead capture via Zapier webhook
- Spam protection with honeypot field

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge) with ES6+ support.

