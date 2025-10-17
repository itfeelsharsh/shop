# Discord Embed Setup Guide

This guide explains how the Discord (and other social media) embed system works and how to set it up properly.

## Problem Statement

When sharing product links on Discord, WhatsApp, Twitter, or other social platforms, the embed was showing generic site information instead of specific product details. This happened because:

1. **Client-side rendering**: React updates meta tags after JavaScript loads
2. **Crawler limitations**: Discord and other crawlers read the initial HTML without executing JavaScript
3. **Missing server-side tags**: The initial HTML had generic meta tags

## Solution Overview

We've implemented a **dual-layer solution**:

### 1. Cloudflare Pages Middleware (Primary Solution)
- **File**: `functions/_middleware.js`
- **How it works**:
  - Detects bot/crawler requests using User-Agent
  - Fetches product data from Firestore REST API
  - Dynamically injects Open Graph and Twitter Card meta tags
  - Returns modified HTML to crawlers
  - Regular users get normal React app

### 2. React-Snap Pre-rendering (Fallback)
- **Configuration**: `package.json` → `reactSnap` section
- **How it works**:
  - Runs after build (`postbuild` script)
  - Pre-renders pages into static HTML
  - Helps with SEO and initial load

## Setup Instructions

### Step 1: Environment Variables in Cloudflare Pages

The middleware needs Firebase credentials to fetch product data. Add these environment variables in your Cloudflare Pages dashboard:

1. Go to **Cloudflare Pages Dashboard**
2. Select your project: **kamikoto**
3. Go to **Settings** → **Environment variables**
4. Add the following variables for **Production** and **Preview**:

```bash
# Firebase Configuration (copy from your .env.local or firebase config)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key

# Alternative names (the middleware checks both)
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_API_KEY=your-api-key
```

**Where to find these values:**
- Check your `src/firebase/config.js` file
- Or check your `.env.local` file
- Or Firebase Console → Project Settings → General

### Step 2: Deploy the Changes

After setting up environment variables:

```bash
# Build and test locally
npm run build

# The build will now run react-snap automatically (postbuild script)

# Deploy to Cloudflare Pages
git add .
git commit -m "Add dynamic meta tags for Discord embeds"
git push origin main
```

Cloudflare Pages will automatically deploy the changes.

## How to Test

### Method 1: Using Discord (Recommended)

1. **Get a product URL**: `https://kamikoto.pages.dev/product/your-product-id`
2. **Paste in Discord**: Send the link in any Discord channel
3. **Expected result**: You should see:
   - Product name and price as title
   - Product description
   - Product image
   - Availability status
   - "In Stock" or "Out of Stock" indicator

### Method 2: Using Debug Tools

#### Discord Embed Debugger
Not officially available, but you can use:
```
https://discordapp.com/api/v10/unfurl?url=YOUR_URL_HERE
```

#### Twitter Card Validator
```
https://cards-dev.twitter.com/validator
```

#### Facebook Sharing Debugger
```
https://developers.facebook.com/tools/debug/
```

#### LinkedIn Post Inspector
```
https://www.linkedin.com/post-inspector/
```

### Method 3: Using curl (Developer Testing)

Test if the middleware is working:

```bash
# Test as a bot (should get dynamic meta tags)
curl -A "Discordbot" "https://kamikoto.pages.dev/product/YOUR_PRODUCT_ID" | grep -i "og:title"

# Test as regular user (should get React app)
curl -A "Mozilla/5.0" "https://kamikoto.pages.dev/product/YOUR_PRODUCT_ID" | grep -i "og:title"
```

**Expected output for bot request:**
```html
<meta property="og:title" content="Product Name - ₹1,299">
```

**Expected output for regular user:**
```html
<meta property="og:title" content="KamiKoto - Your Online Stationery Shop">
```

### Method 4: Chrome DevTools

1. Open product page in Chrome
2. Right-click → **Inspect** → **Network** tab
3. Check the **Document** request
4. Look at **Response Headers** and **Preview**
5. Search for `og:title` in the HTML

**For bots**: The meta tags should be in the initial HTML response
**For users**: The meta tags are updated by React Helmet after page load

## Troubleshooting

### Issue: Still showing generic site info

**Possible causes:**
1. Environment variables not set in Cloudflare Pages
2. Firestore rules blocking public read access
3. Product ID doesn't exist in Firestore
4. Middleware not deploying correctly

**Solutions:**
1. Verify environment variables in Cloudflare Pages dashboard
2. Check Firestore rules allow read access to products collection
3. Test with a known product ID
4. Check Cloudflare Pages deployment logs

### Issue: Discord not updating the embed

**Cause**: Discord caches embeds for ~30 minutes

**Solutions:**
1. Wait 30 minutes and try again
2. Add a query parameter: `?v=1`, `?v=2`, etc.
3. Use a different channel to test

### Issue: Local testing doesn't work

**Cause**: The middleware only works on Cloudflare Pages (edge runtime)

**Solution**: Deploy to Cloudflare Pages or use a staging environment

### Issue: Images not loading in embed

**Possible causes:**
1. Image URL is not absolute (must start with https://)
2. CORS issues
3. Image size too large

**Solutions:**
1. Ensure product images use full URLs: `https://...`
2. Use HTTPS URLs only
3. Keep images under 8MB (Discord limit)

## Meta Tags Reference

The middleware injects these meta tags for product pages:

### Basic Tags
```html
<title>Product Name | KamiKoto - Premium Stationery</title>
<meta name="description" content="Product description...">
```

### OpenGraph (Discord, WhatsApp, Facebook, LinkedIn)
```html
<meta property="og:title" content="Product Name - ₹1,299">
<meta property="og:description" content="Product description...">
<meta property="og:image" content="https://...">
<meta property="og:url" content="https://kamikoto.pages.dev/product/id">
<meta property="og:type" content="product">
<meta property="og:price:amount" content="1299">
<meta property="og:price:currency" content="INR">
```

### Twitter Cards
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Product Name - ₹1,299">
<meta name="twitter:description" content="Product description...">
<meta name="twitter:image" content="https://...">
<meta name="twitter:label1" content="Price">
<meta name="twitter:data1" content="₹1,299">
```

## Architecture Diagram

```
User/Bot Request
    ↓
Cloudflare Pages Middleware (functions/_middleware.js)
    ↓
Is Product Page? (/product/:id)
    ↓
    ├─ YES → Is Bot/Crawler?
    │         ↓
    │         ├─ YES → Fetch Product from Firestore
    │         │         ↓
    │         │         Inject Dynamic Meta Tags
    │         │         ↓
    │         │         Return Modified HTML
    │         │
    │         └─ NO → Return React App (index.html)
    │                  ↓
    │                  React Helmet Updates Meta Tags
    │
    └─ NO → Return Static Files
```

## Bot Detection

The middleware detects these crawlers:
- Discord (discordbot)
- WhatsApp (whatsapp)
- Twitter (twitterbot)
- Facebook (facebookexternalhit)
- LinkedIn (linkedinbot)
- Slack (slackbot)
- Telegram (telegrambot)
- Pinterest (pinterestbot)
- Reddit (redditbot)
- Search engines (googlebot, bingbot, etc.)

## Performance

- **Bot requests**: ~100-300ms (includes Firestore fetch)
- **Regular users**: No impact (normal React app)
- **Caching**: Bot responses cached for 1 hour (configurable)
- **Firestore calls**: Only for bot requests on product pages

## Maintenance

### Updating Bot Patterns

Edit `functions/_middleware.js` → `isBot()` function:

```javascript
const botPatterns = [
  'bot', 'crawler', 'spider',
  'your-new-bot-pattern',
  // ... existing patterns
];
```

### Updating Meta Tags

Edit `functions/_middleware.js` → `generateMetaTags()` function to modify:
- Title format
- Description length
- Additional meta tags
- Structured data

### Monitoring

Check Cloudflare Pages **Functions** logs to see:
- Which bots are accessing your site
- Product fetch success/failures
- Performance metrics

## Additional Resources

- [Cloudflare Pages Functions Docs](https://developers.cloudflare.com/pages/platform/functions/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Docs](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Discord Embed Guide](https://discord.com/developers/docs/resources/channel#embed-object)
- [Firestore REST API](https://firebase.google.com/docs/firestore/use-rest-api)

## Support

If you encounter issues:
1. Check Cloudflare Pages deployment logs
2. Verify environment variables are set
3. Test with curl commands above
4. Check product exists in Firestore
5. Verify Firestore security rules allow public reads

---

**Last Updated**: October 2024
**Maintained by**: KamiKoto Development Team
