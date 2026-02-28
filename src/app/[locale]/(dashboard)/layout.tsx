import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Transform user data for the header
  const userData = user ? {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    email: user.email,
    avatar_url: user.user_metadata?.avatar_url,
    initials: (user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()
  } : null;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground selection:bg-primary/20">
      {/* Sidebar for desktop */}
      <aside className="hidden w-72 flex-col border-r border-sidebar-border bg-sidebar md:flex z-50 shadow-xl shadow-black/5">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        
        {/* Decorative Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px]" />
        </div>

        {/* Header (Visible on both mobile and desktop, replaces old mobile header) */}
        <Header user={userData} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 z-10 scroll-smooth">
          <div className="max-w-full mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
