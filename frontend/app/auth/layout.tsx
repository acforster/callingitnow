import React from 'react';

// This layout applies ONLY to the /auth routes
// It ensures they don't inherit the main app's 3-column grid
export default function AuthRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}