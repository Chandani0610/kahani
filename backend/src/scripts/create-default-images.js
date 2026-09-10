// backend/scripts/create-default-images.js
const fs = require('fs');
const path = require('path');

// Correct path: backend/uploads/stories
const uploadDir = path.join(__dirname, '../uploads/stories');

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 Created uploads directory:', uploadDir);
}

// =============================================
// DEFAULT STORY IMAGE (400x400)
// =============================================
const defaultStorySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="storyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fb923c;stop-opacity:0.15" />
      <stop offset="100%" style="stop-color:#f472b6;stop-opacity:0.15" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="#f9fafb"/>
  <rect width="400" height="400" fill="url(#storyGrad)"/>
  <text x="200" y="195" font-family="Arial, sans-serif" font-size="80" text-anchor="middle" fill="#fb923c" opacity="0.6">📖</text>
  <text x="200" y="260" font-family="Arial, sans-serif" font-size="16" font-weight="600" text-anchor="middle" fill="#9ca3af">Story Image</text>
  <text x="200" y="285" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#d1d5db">Click to upload</text>
</svg>`;

// =============================================
// DEFAULT BANNER IMAGE (800x200)
// =============================================
const defaultBannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200" viewBox="0 0 800 200">
  <defs>
    <linearGradient id="bannerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fb923c;stop-opacity:0.2" />
      <stop offset="100%" style="stop-color:#f472b6;stop-opacity:0.2" />
    </linearGradient>
  </defs>
  <rect width="800" height="200" fill="#f9fafb"/>
  <rect width="800" height="200" fill="url(#bannerGrad)"/>
  <text x="400" y="105" font-family="Arial, sans-serif" font-size="50" text-anchor="middle" fill="#fb923c" opacity="0.5">📚</text>
  <text x="400" y="145" font-family="Arial, sans-serif" font-size="16" font-weight="600" text-anchor="middle" fill="#9ca3af">Banner Image</text>
  <text x="400" y="168" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#d1d5db">Upload a banner image</text>
</svg>`;

// =============================================
// NO IMAGE PLACEHOLDER
// =============================================
const noImageSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#f3f4f6"/>
  <circle cx="200" cy="180" r="70" fill="#e5e7eb" opacity="0.5"/>
  <text x="200" y="195" font-family="Arial, sans-serif" font-size="60" text-anchor="middle" fill="#9ca3af" opacity="0.5">🖼️</text>
  <text x="200" y="255" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#9ca3af">No Image</text>
</svg>`;

// =============================================
// WRITE FILES
// =============================================
try {
    // Write default story image
    const storyPath = path.join(uploadDir, 'default-story.jpg');
    fs.writeFileSync(storyPath, defaultStorySvg);
    console.log('✅ Default story image:', storyPath);

    // Write default banner image
    const bannerPath = path.join(uploadDir, 'default-banner.jpg');
    fs.writeFileSync(bannerPath, defaultBannerSvg);
    console.log('✅ Default banner image:', bannerPath);

    // Write no image placeholder
    const noImagePath = path.join(uploadDir, 'no-image.jpg');
    fs.writeFileSync(noImagePath, noImageSvg);
    console.log('✅ No image placeholder:', noImagePath);

    console.log('\n📁 Images saved to:', uploadDir);
    console.log('📖 URL: /uploads/stories/default-story.jpg');
    console.log('🖼️ URL: /uploads/stories/default-banner.jpg');
    console.log('🚫 URL: /uploads/stories/no-image.jpg');
    console.log('\n✅ Default images created successfully!');

} catch (error) {
    console.error('❌ Error creating default images:', error);
    process.exit(1);
}