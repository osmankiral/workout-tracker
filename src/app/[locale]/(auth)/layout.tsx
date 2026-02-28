import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('Auth');

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex flex-col p-4 md:p-8 relative bg-background">
        <Link 
          href="/" 
          className="absolute top-4 left-4 md:top-8 md:left-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToHome')}
        </Link>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm space-y-6">
            {children}
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:block relative bg-muted text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-zinc-900/0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-zinc-900 to-zinc-900" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">{t('promoTitle')}</h2>
            <p className="text-zinc-400 max-w-md mx-auto">
              {t('promoDescription')}
            </p>
          </div>
          {/* Abstract visual elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -z-10" />
        </div>
      </div>
    </div>
  );
}
