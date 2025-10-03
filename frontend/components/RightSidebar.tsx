'use client';

// This component will hold contextual information, like group details.
export default function RightSidebar({ children }: { children?: React.ReactNode }) {
  return (
    <aside className="col-span-12 lg:col-span-3 order-3 lg:order-3">
      <div className="sticky top-24 space-y-6">
        {children}
      </div>
    </aside>
  );
}