'use client';

import { LoadScript, LoadScriptProps } from '@react-google-maps/api';

const libraries: LoadScriptProps['libraries'] = ['places'];

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  
  if (!apiKey) {
    console.error('Google Maps API key is not set in environment variables');
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
    >
      {children}
    </LoadScript>
  );
} 