import { createClient } from '@supabase/supabase-js';
import type { PlaceResult } from './google-places';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SavedLead {
  id: string;
  place_id: string;
  name: string;
  formatted_address: string;
  website?: string;
  phone?: string;
  rating?: number;
  total_ratings?: number;
  flags: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadList {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

export interface ListItem {
  id: string;
  list_id: string;
  lead_id: string;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LeadTag {
  id: string;
  lead_id: string;
  tag: string;
  created_at: string;
}

export async function saveLead(lead: PlaceResult, flags: string[] = [], notes: string = '') {
  const { data, error } = await supabase
    .from('leads')
    .upsert({
      place_id: lead.place_id,
      name: lead.name,
      formatted_address: lead.formatted_address,
      website: lead.website,
      phone: lead.formatted_phone_number,
      rating: lead.rating,
      total_ratings: lead.user_ratings_total,
      flags,
      notes,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as SavedLead;
}

export async function removeLead(placeId: string) {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('place_id', placeId);

  if (error) throw error;
}

export async function updateLeadFlags(placeId: string, flags: string[]) {
  const { error } = await supabase
    .from('leads')
    .update({ flags, updated_at: new Date().toISOString() })
    .eq('place_id', placeId);

  if (error) throw error;
}

export async function updateLeadNotes(placeId: string, notes: string) {
  const { error } = await supabase
    .from('leads')
    .update({ notes, updated_at: new Date().toISOString() })
    .eq('place_id', placeId);

  if (error) throw error;
}

export async function getSavedLead(placeId: string) {
  const { data, error } = await supabase
    .from('leads')
    .select()
    .eq('place_id', placeId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as SavedLead | null;
}

export async function getSavedLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select()
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as SavedLead[];
}

// Lead List Functions
export async function createLeadList(name: string, description?: string) {
  const { data, error } = await supabase
    .from('lead_lists')
    .insert({
      name,
      description,
    })
    .select()
    .single();

  if (error) throw error;
  return data as LeadList;
}

export async function getLeadLists() {
  const { data, error } = await supabase
    .from('lead_lists')
    .select()
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as LeadList[];
}

export async function updateLeadList(id: string, updates: Partial<LeadList>) {
  const { error } = await supabase
    .from('lead_lists')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function archiveLeadList(id: string) {
  const { error } = await supabase
    .from('lead_lists')
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

// List Item Functions
export async function addLeadToList(listId: string, leadId: string, notes?: string, status: string = 'new') {
  const { data, error } = await supabase
    .from('list_items')
    .insert({
      list_id: listId,
      lead_id: leadId,
      notes,
      status,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ListItem;
}

export async function getLeadsInList(listId: string) {
  const { data, error } = await supabase
    .from('list_items')
    .select(`
      *,
      lead:leads (*)
    `)
    .eq('list_id', listId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateListItem(id: string, updates: Partial<ListItem>) {
  const { error } = await supabase
    .from('list_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function removeLeadFromList(listId: string, leadId: string) {
  const { error } = await supabase
    .from('list_items')
    .delete()
    .match({ list_id: listId, lead_id: leadId });

  if (error) throw error;
}

// Lead Tag Functions
export async function addTagToLead(leadId: string, tag: string) {
  const { data, error } = await supabase
    .from('lead_tags')
    .insert({
      lead_id: leadId,
      tag,
    })
    .select()
    .single();

  if (error) throw error;
  return data as LeadTag;
}

export async function removeTagFromLead(leadId: string, tag: string) {
  const { error } = await supabase
    .from('lead_tags')
    .delete()
    .match({ lead_id: leadId, tag });

  if (error) throw error;
}

export async function getLeadTags(leadId: string) {
  const { data, error } = await supabase
    .from('lead_tags')
    .select()
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as LeadTag[];
} 