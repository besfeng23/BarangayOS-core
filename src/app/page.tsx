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

  return (
    <div className="relative min-h-screen w-full">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-40">
        <div className="space-y-12">
          <Section title="Core Services">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreApps.map((app) => (
                <div key={app.id} className="h-full">
                  <AppCard app={app} />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Optional Tools">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {optionalApps.map((app) => (
                <div key={app.id} className="h-full">
                  <AppCard app={app} />
                </div>
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
