'use client'; // 添加 "use client" 指令

import { generateRandomColdColor, generateRandomWarmColor } from './colorUtils';
import { useLayoutEffect } from 'react';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useLayoutEffect(() => {
    const coldColor1 = generateRandomColdColor();
    const warmColor1 = generateRandomWarmColor();
    const coldColor2 = generateRandomColdColor();
    const warmColor2 = generateRandomWarmColor();

    document.body.style.setProperty('--cold-color-1', coldColor1);
    document.body.style.setProperty('--warm-color-1', warmColor1);
    document.body.style.setProperty('--cold-color-2', coldColor2);
    document.body.style.setProperty('--warm-color-2', warmColor2);
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Fadegentle WebSite</title>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS Feed for Fadegentle WebSite"
          href="/rss.xml"
        />
      </head>
      <body>
        <header className="site-header">
          <div className="title-container">
            <a href="/" className="site-title">Fadegentle WebSite</a>
            <a href="/rss.xml" className="rss-link" target="_blank" rel="noopener noreferrer">
              <svg className="rss-icon" viewBox="0 0 24 24">
                <path d="M6.18,15.64A2.18,2.18 0 0,1 8.36,17.82C8.36,19 7.38,20 6.18,20C5,20 4,19 4,17.82A2.18,2.18 0 0,1 6.18,15.64M4,4.44A15.56,15.56 0 0,1 19.56,20H16.73A12.73,12.73 0 0,0 4,7.27V4.44M4,10.1A9.9,9.9 0 0,1 13.9,20H11.07A7.07,7.07 0 0,0 4,12.93V10.1Z" />
              </svg>
              RSS
            </a>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}