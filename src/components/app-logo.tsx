import { cn } from '@/lib/utils';

export function AppLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 text-lg font-semibold", className)}>
      {/* Replace the SVG with an image */}
      <img
        src="/images/asensologo.png"
        alt="Asenso Logo"
        className="h-6 w-auto"
      />
    </div>
  );
}
