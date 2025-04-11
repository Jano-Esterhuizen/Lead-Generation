'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Globe, Phone } from 'lucide-react';
import type { PlaceResult } from '@/lib/google-places';
import { LeadManagement } from './lead-management';

interface LeadSearchResultsProps {
  results: PlaceResult[];
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
}

export function LeadSearchResults({ results, onLoadMore, hasNextPage, isLoading }: LeadSearchResultsProps) {
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const toggleLeadSelection = (placeId: string) => {
    setSelectedLead(current => current === placeId ? null : placeId);
  };

  return (
    <div className="space-y-4">
      {results.length === 0 ? (
        <div className="rounded-lg border bg-white p-6 text-center">
          <p className="text-gray-500">No results found. Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <div
              key={result.place_id}
              className="rounded-lg border bg-white p-6 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">{result.name}</h3>
                  <p className="text-sm text-gray-500">{result.formatted_address}</p>
                  
                  {result.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">
                        {result.rating} ({result.user_ratings_total} reviews)
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {result.website && (
                    <a
                      href={result.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                  {result.formatted_phone_number && (
                    <a
                      href={`tel:${result.formatted_phone_number}`}
                      className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {selectedLead === result.place_id && (
                <>
                  <div className="mt-4 space-y-2 border-t pt-4">
                    {result.opening_hours?.weekday_text && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Opening Hours</h4>
                        <ul className="text-sm text-gray-500">
                          {result.opening_hours.weekday_text.map((hours, index) => (
                            <li key={index}>{hours}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <LeadManagement lead={result} />
                </>
              )}

              <button
                onClick={() => toggleLeadSelection(result.place_id)}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800"
              >
                {selectedLead === result.place_id ? 'Show less' : 'Show more'}
              </button>
            </div>
          ))}

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <button
                onClick={onLoadMore}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load more results'}
                {!isLoading && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 