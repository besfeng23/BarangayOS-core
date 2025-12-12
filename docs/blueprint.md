# **App Name**: BarangayOS App Hub

## Core Features:

- Core Services Grid: Display a grid of locked core service apps with live badge updates fetched directly from Firestore using the defined data schema.
- Optional Tools Carousel: Implement a horizontally scrolling carousel featuring optional tools. Each tool has a 'GET' button.
- Partner Services Row: Create a visually distinct row dedicated to third-party partner apps, differentiated with a pale blue background tint.
- Global SOS Button: Integrate a prominent, fixed Red Floating Action Button (FAB) in the bottom navigation dock.
- Live Tile Data Fetching: Fetch all application data and update badge notifications directly from Firestore, rendering them according to the application data schema.

## Style Guidelines:

- Tablet-first landscape layout optimized for 1024px+ screens.
- Background: Subtle mesh gradient transitioning between white (#FFFFFF) and pale blue (#E0F7FA).
- Primary color: Bright blue (#3B82F6) for 'GET' buttons.
- Accent color: Darker blue (#2563EB) for hover states.
- Font: 'Inter' sans-serif for a modern, machined look; suitable for headlines or body text.
- Header: Glassmorphism effect with 'Good Morning' greeting and integrated search bar.
- Footer: Floating glass dock with Back, Home, and SOS buttons.
- Subtle Framer Motion animations (hover lift, locked shake).