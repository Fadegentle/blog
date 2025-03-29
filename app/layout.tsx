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
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}