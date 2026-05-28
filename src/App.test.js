import fs from 'fs';
import path from 'path';

describe('public entry HTML for deep links', () => {
  test('uses root-relative asset paths so direct routes can load the app shell', () => {
    const htmlPath = path.resolve(__dirname, '../public/index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    expect(html).toContain('src="/js/bot-detection.js"');
    expect(html).toContain('src="/js/prerender-support.js"');
    expect(html).not.toContain('%PUBLIC_URL%');
  });
});
