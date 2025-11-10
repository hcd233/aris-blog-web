import { UserHeader } from '@/components/user-header';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <UserHeader />
      {children}
    </div>
  );
}

