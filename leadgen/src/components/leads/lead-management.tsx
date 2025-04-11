'use client';

import { useState, useEffect } from 'react';
import { Star, Flag, Trash2, Plus, Loader2 } from 'lucide-react';
import type { PlaceResult } from '@/lib/google-places';
import { saveLead, removeLead, updateLeadFlags, updateLeadNotes, getSavedLead, type SavedLead } from '@/lib/database';
import toast from 'react-hot-toast';

interface LeadManagementProps {
  lead: PlaceResult;
}

interface OpportunityFlag {
  id: string;
  name: string;
  color: string;
}

const defaultFlags: OpportunityFlag[] = [
  { id: 'high-potential', name: 'High Potential', color: 'bg-green-100 text-green-800' },
  { id: 'needs-website', name: 'Needs Website', color: 'bg-blue-100 text-blue-800' },
  { id: 'needs-seo', name: 'Needs SEO', color: 'bg-purple-100 text-purple-800' },
  { id: 'follow-up', name: 'Follow Up', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'contacted', name: 'Contacted', color: 'bg-gray-100 text-gray-800' },
];

export function LeadManagement({ lead }: LeadManagementProps) {
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSavedLead = async () => {
      try {
        const savedLead = await getSavedLead(lead.place_id);
        if (savedLead) {
          setIsSaved(true);
          setSelectedFlags(savedLead.flags);
          setNotes(savedLead.notes || '');
        }
      } catch (error) {
        console.error('Error loading saved lead:', error);
        toast.error('Failed to load saved lead data');
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedLead();
  }, [lead.place_id]);

  const toggleFlag = async (flagId: string) => {
    const newFlags = selectedFlags.includes(flagId)
      ? selectedFlags.filter(id => id !== flagId)
      : [...selectedFlags, flagId];
    
    setSelectedFlags(newFlags);

    if (isSaved) {
      try {
        await updateLeadFlags(lead.place_id, newFlags);
        toast.success('Flags updated');
      } catch (error) {
        console.error('Error updating flags:', error);
        toast.error('Failed to update flags');
      }
    }
  };

  const handleSave = async () => {
    try {
      await saveLead(lead, selectedFlags, notes);
      setIsSaved(true);
      toast.success('Lead saved to your list');
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error('Failed to save lead');
    }
  };

  const handleRemove = async () => {
    try {
      await removeLead(lead.place_id);
      setIsSaved(false);
      setSelectedFlags([]);
      setNotes('');
      toast.success('Lead removed from your list');
    } catch (error) {
      console.error('Error removing lead:', error);
      toast.error('Failed to remove lead');
    }
  };

  const handleNotesChange = async (newNotes: string) => {
    setNotes(newNotes);
    
    if (isSaved) {
      try {
        await updateLeadNotes(lead.place_id, newNotes);
      } catch (error) {
        console.error('Error updating notes:', error);
        toast.error('Failed to update notes');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center border-t pt-4">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Lead Management</h4>
        <button
          onClick={isSaved ? handleRemove : handleSave}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
            isSaved
              ? 'text-red-600 hover:text-red-700'
              : 'text-blue-600 hover:text-blue-700'
          }`}
        >
          {isSaved ? (
            <>
              <Trash2 className="h-4 w-4" />
              Remove from list
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add to list
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Opportunity Flags
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {defaultFlags.map(flag => (
              <button
                key={flag.id}
                onClick={() => toggleFlag(flag.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${
                  flag.color
                } ${
                  selectedFlags.includes(flag.id)
                    ? 'ring-2 ring-offset-2'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Flag className="h-3.5 w-3.5" />
                {flag.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="text-sm font-medium text-gray-700"
          >
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={e => handleNotesChange(e.target.value)}
            placeholder="Add your notes about this lead..."
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
} 