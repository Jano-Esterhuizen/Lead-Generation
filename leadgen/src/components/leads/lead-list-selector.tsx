'use client';

import { useState, useEffect } from 'react';
import { Plus, FolderPlus, Archive, MoreVertical } from 'lucide-react';
import { createLeadList, getLeadLists, archiveLeadList, type LeadList } from '@/lib/database';
import toast from 'react-hot-toast';

interface LeadListSelectorProps {
  onListSelect: (listId: string) => void;
  selectedListId?: string;
}

export function LeadListSelector({ onListSelect, selectedListId }: LeadListSelectorProps) {
  const [lists, setLists] = useState<LeadList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const leadLists = await getLeadLists();
      setLists(leadLists);
      
      // Select first list if none selected
      if (!selectedListId && leadLists.length > 0) {
        onListSelect(leadLists[0].id);
      }
    } catch (error) {
      console.error('Error loading lists:', error);
      toast.error('Failed to load lead lists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newListName.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    try {
      const newList = await createLeadList(newListName.trim(), newListDescription.trim() || undefined);
      setLists(current => [newList, ...current]);
      onListSelect(newList.id);
      setShowNewListForm(false);
      setNewListName('');
      setNewListDescription('');
      toast.success('List created successfully');
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('Failed to create list');
    }
  };

  const handleArchiveList = async (listId: string) => {
    try {
      await archiveLeadList(listId);
      setLists(current => current.filter(list => list.id !== listId));
      
      // If archived list was selected, select first available list
      if (selectedListId === listId && lists.length > 1) {
        const nextList = lists.find(list => list.id !== listId);
        if (nextList) {
          onListSelect(nextList.id);
        }
      }
      
      toast.success('List archived');
    } catch (error) {
      console.error('Error archiving list:', error);
      toast.error('Failed to archive list');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lead Lists</h2>
        <button
          onClick={() => setShowNewListForm(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          New List
        </button>
      </div>

      {showNewListForm && (
        <form onSubmit={handleCreateList} className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="space-y-4">
            <div>
              <label htmlFor="listName" className="block text-sm font-medium text-gray-700">
                List Name
              </label>
              <input
                type="text"
                id="listName"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Hot Leads"
              />
            </div>
            
            <div>
              <label htmlFor="listDescription" className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                id="listDescription"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Add a description for your list..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewListForm(false)}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create List
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : lists.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <FolderPlus className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No lists yet. Create your first list to get started!</p>
          </div>
        ) : (
          lists.map(list => (
            <div
              key={list.id}
              className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                selectedListId === list.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
              onClick={() => onListSelect(list.id)}
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-medium">{list.name}</h3>
                {list.description && (
                  <p className="mt-0.5 truncate text-xs text-gray-500">{list.description}</p>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleArchiveList(list.id);
                }}
                className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              >
                <Archive className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 