import { appsData } from '@/data/apps';
import type { AppData } from '@/types';
import Header from '@/components/app-hub/Header';
import Footer from '@/components/app-hub/Footer';
import Section from '@/components/app-hub/Section';
import AppCard from '@/components/app-hub/AppCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {coreApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </Section>

          <Section title="Optional Tools">
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {optionalApps.map((app, index) => (
                  <CarouselItem key={index} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                    <AppCard app={app} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="ml-12" />
              <CarouselNext className="mr-12" />
            </Carousel>
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
