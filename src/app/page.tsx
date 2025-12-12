import Link from 'next/link';
import { appsData } from '@/data/apps';
import Header from '@/components/app-hub/Header';
import Footer from '@/components/app-hub/Footer';
import Section from '@/components/app-hub/Section';
import AppCard from '@/components/app-hub/AppCard';

export default function Home() {
  // In a real app, this data would be fetched from a remote source like Firestore.
  const coreApps = appsData.filter((app) => app.category === 'core');
  const optionalApps = appsData.filter((app) => app.category === 'optional');
  const partnerApps = appsData.filter((app) => app.category === 'partner');

  const getAppUrl = (appName: string): string => {
    switch (appName) {
      case 'Blotter Log':
        return '/blotter';
      case 'Resident Records':
        return '/residents';
      case 'Certificates':
        return '/certificates';
      case 'Business Permits':
        return '/permits';
      case 'Announcements':
        return '/announcements';
      case "Captain's Dashboard":
        return '/dashboard';
      default:
        return '#'; // Return a non-navigable link for unhandled cases
    }
  };

  const renderCoreApp = (app: (typeof appsData)[0]) => {
    const href = getAppUrl(app.name);
    if (app.isLocked) {
      // For locked core apps, wrap with a link
      return (
        <Link key={app.id} href={href} passHref>
          <div className="h-full">
            <AppCard app={app} />
          </div>
        </Link>
      );
    }
    // For other apps or if not locked, render without a link wrapper at this level
    return <AppCard key={app.id} app={app} />;
  };

  return (
    <div className="relative min-h-screen w-full">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-40">
        <div className="space-y-12">
          <Section title="Core Services">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreApps.map(renderCoreApp)}
            </div>
          </Section>

          <Section title="Optional Tools">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {optionalApps.map((app) => (
                    <AppCard key={app.id} app={app} />
                ))}
            </div>
          </Section>

          <Section title="Partner Services">
            <div className="rounded-xl bg-primary/5 p-4 sm:p-6">
               <div className="flex space-x-6 overflow-x-auto pb-4 -mb-4">
                  {partnerApps.map((app) => (
                    <div key={app.id} className="min-w-[10rem] sm:min-w-[12rem]">
                      <AppCard app={app} />
                    </div>
                  ))}
                </div>
            </div>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
