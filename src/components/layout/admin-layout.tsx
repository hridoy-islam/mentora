
import { Toaster } from '@/components/ui/toaster';
import { useSelector } from 'react-redux';
import { SidebarInset, SidebarProvider } from '../ui/sidebar';
import { AppSidebar } from '../shared/app-sidebar';
import { SiteHeader } from '../shared/site-header';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user } = useSelector((state: any) => state.auth);

  
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)'
        } as React.CSSProperties
      }
    >
      <div className="flex h-full w-full bg-gray-100">
        <AppSidebar />

        <SidebarInset className="flex w-full  flex-col overflow-auto bg-white  md:ml-64 md:shadow-md">
          <div className='md:hidden'>
            <SiteHeader />
            </div>
          <main className="w-full p-2 ">{children}</main>
        </SidebarInset>
      </div>

      <Toaster />
    </SidebarProvider>
  );
}
