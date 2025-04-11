"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "react-hot-toast"
import { Plus, ListPlus, Trash2, FolderOpen } from "lucide-react"
import type { SavedLead, LeadList } from "@/lib/database"

export default function LeadsPage() {
  const [leads, setLeads] = useState<SavedLead[]>([])
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [lists, setLists] = useState<LeadList[]>([])
  const [loading, setLoading] = useState(true)
  const [newListName, setNewListName] = useState("")
  const [newListDescription, setNewListDescription] = useState("")
  const [isCreateListOpen, setIsCreateListOpen] = useState(false)
  const [selectedList, setSelectedList] = useState<string | null>(null)

  useEffect(() => {
    loadLeads()
    loadLists()
  }, [])

  useEffect(() => {
    if (selectedList) {
      loadLeadsForList(selectedList)
    } else {
      loadLeads()
    }
  }, [selectedList])

  const loadLeadsForList = async (listId: string) => {
    try {
      const supabase = createClient()
      interface ListItem {
        lead_id: string;
        leads: SavedLead;
      }
      
      const { data, error } = await supabase
        .from("list_items")
        .select(`
          lead_id,
          leads (*)
        `)
        .eq("list_id", listId) as { data: ListItem[] | null; error: any }

      if (error) throw error
      
      // Extract the leads from the joined query
      const listLeads = data?.map(item => item.leads) || []
      setLeads(listLeads)
    } catch (err) {
      console.error("Error loading list leads:", err)
      toast.error("Failed to load leads for this list")
    }
  }

  const loadLeads = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (err) {
      console.error("Error loading leads:", err)
      toast.error("Failed to load leads")
    } finally {
      setLoading(false)
    }
  }

  const loadLists = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("lead_lists")
        .select("*")
        .eq("is_archived", false)
        .order("created_at", { ascending: false })

      if (error) throw error
      setLists(data || [])
    } catch (err) {
      console.error("Error loading lists:", err)
      toast.error("Failed to load lists")
    }
  }

  const handleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads)
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId)
    } else {
      newSelected.add(leadId)
    }
    setSelectedLeads(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(leads.map(lead => lead.id)))
    }
  }

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error("Please enter a list name")
      return
    }

    try {
      const supabase = createClient()
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      if (!user) {
        toast.error("You must be logged in to create a list")
        return
      }

      const { data: list, error: listError } = await supabase
        .from("lead_lists")
        .insert([
          {
            name: newListName.trim(),
            description: newListDescription.trim() || null,
            user_id: user.id
          },
        ])
        .select()
        .single()

      if (listError) throw listError

      // Add selected leads to the new list
      const listItems = Array.from(selectedLeads).map(leadId => ({
        list_id: list.id,
        lead_id: leadId,
        status: "new",
      }))

      const { error: itemsError } = await supabase
        .from("list_items")
        .insert(listItems)

      if (itemsError) throw itemsError

      toast.success("List created successfully!")
      setNewListName("")
      setNewListDescription("")
      setIsCreateListOpen(false)
      loadLists()
    } catch (err) {
      console.error("Error creating list:", err)
      toast.error("Failed to create list")
    }
  }

  const handleAddToList = async (listId: string) => {
    try {
      const supabase = createClient()
      const listItems = Array.from(selectedLeads).map(leadId => ({
        list_id: listId,
        lead_id: leadId,
        status: "new",
      }))

      const { error } = await supabase
        .from("list_items")
        .insert(listItems)

      if (error) throw error

      toast.success("Leads added to list!")
      setSelectedLeads(new Set())
    } catch (err) {
      console.error("Error adding to list:", err)
      toast.error("Failed to add leads to list")
    }
  }

  const handleDeleteLeads = async () => {
    if (!selectedLeads.size) return

    try {
      const supabase = createClient()
      const leadsToDelete = Array.from(selectedLeads)

      // First, delete all list_items entries for these leads
      const { error: listItemsError } = await supabase
        .from("list_items")
        .delete()
        .in("lead_id", leadsToDelete)

      if (listItemsError) throw listItemsError

      // Then delete the leads themselves
      const { error: leadsError } = await supabase
        .from("leads")
        .delete()
        .in("id", leadsToDelete)

      if (leadsError) throw leadsError

      toast.success("Leads deleted successfully!")
      setSelectedLeads(new Set())
      
      // Refresh the leads list
      if (selectedList) {
        loadLeadsForList(selectedList)
      } else {
        loadLeads()
      }
    } catch (err) {
      console.error("Error deleting leads:", err)
      toast.error("Failed to delete leads")
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-72 bg-gray-50 border-r p-6 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Lists</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateListOpen(true)}
              className="hover:bg-gray-100"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setSelectedList(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                !selectedList
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              All Leads
            </button>
            
            {lists.length > 0 ? (
              <div className="mt-2 space-y-1">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => setSelectedList(list.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center space-x-2 group transition-colors ${
                      selectedList === list.id
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FolderOpen className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate flex-1">{list.name}</span>
                    {list.description && (
                      <span className="hidden group-hover:block text-xs text-gray-500 truncate">
                        {list.description}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                  <FolderOpen className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-2">No lists created yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateListOpen(true)}
                  className="text-xs"
                >
                  Create your first list
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">
              {selectedList 
                ? lists.find(l => l.id === selectedList)?.name || "My Leads"
                : "All Leads"
              }
            </h1>
            <div className="flex gap-4">
              {selectedLeads.size > 0 && (
                <>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <ListPlus className="w-4 h-4 mr-2" />
                        Add to List
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add to List</DialogTitle>
                        <DialogDescription>
                          Choose a list to add the selected leads to
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {lists.map((list) => (
                          <Button
                            key={list.id}
                            variant="outline"
                            className="justify-start"
                            onClick={() => handleAddToList(list.id)}
                          >
                            {list.name}
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="destructive" onClick={handleDeleteLeads}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="selectAll"
                checked={selectedLeads.size === leads.length && leads.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <label
                htmlFor="selectAll"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Select All
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {leads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        checked={selectedLeads.has(lead.id)}
                        onCheckedChange={() => handleSelectLead(lead.id)}
                      />
                      <div>
                        <CardTitle className="text-lg">{lead.name}</CardTitle>
                        <CardDescription>{lead.formatted_address}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {lead.phone && (
                        <p className="text-sm">
                          <span className="font-medium">Phone:</span> {lead.phone}
                        </p>
                      )}
                      {lead.rating && (
                        <p className="text-sm">
                          <span className="font-medium">Rating:</span> {lead.rating}/5 ({lead.total_ratings} reviews)
                        </p>
                      )}
                      {lead.flags && lead.flags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {lead.flags.map((flag) => (
                            <span
                              key={flag}
                              className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                            >
                              {flag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <p className="text-xs text-gray-500">
                      Added {new Date(lead.created_at).toLocaleDateString()}
                    </p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create List Dialog */}
      <Dialog open={isCreateListOpen} onOpenChange={setIsCreateListOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
            <DialogDescription>
              Create a new list to organize your leads
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="Enter list description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateListOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateList}>Create List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 