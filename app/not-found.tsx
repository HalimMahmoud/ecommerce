import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-primary mb-4">404</p>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Page not found</h2>
        <p className="text-muted-foreground text-sm mb-6">
          The page you&#39;re looking for doesn&#39;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
