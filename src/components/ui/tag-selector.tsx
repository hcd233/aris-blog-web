"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input"; // Not used in this component
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { tagService } from "@/services/tag.service";
import { generateSlugWithFallback } from "@/lib/slugify";
import type { Tag } from "@/types/api/tag.types";
import { toast } from "sonner";

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxTags?: number;
}

export function TagSelector({
  value,
  onChange,
  placeholder = "Select or create tags...",
  disabled = false,
  maxTags = 10,
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [creating, setCreating] = useState(false);

  // Load tags when component mounts or popover opens
  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await tagService.getTagList({
        page: 1,
        pageSize: 100, // Load more tags for selection
      });
      setTags(response.tags);
    } catch (error) {
      console.error("Failed to load tags:", error);
      toast.error("Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  // Load tags when popover opens
  useEffect(() => {
    if (open && tags.length === 0) {
      loadTags();
    }
  }, [open, tags.length]); // Include tags.length to handle dependency

  // Get selected tag objects
  const selectedTags = tags.filter(tag => value.includes(tag.slug));

  // Check if current search value would create a new tag
  const searchValueTrimmed = searchValue.trim().toLowerCase();
  const existingTag = tags.find(tag => 
    tag.name.toLowerCase() === searchValueTrimmed || 
    tag.slug.toLowerCase() === searchValueTrimmed
  );
  const canCreateNew = searchValueTrimmed && !existingTag && !value.includes(searchValueTrimmed);

  // Handle tag selection/deselection
  const handleTagToggle = (tagSlug: string) => {
    const newTags = value.includes(tagSlug)
      ? value.filter(t => t !== tagSlug)
      : [...value, tagSlug];
    
    if (newTags.length <= maxTags) {
      onChange(newTags);
    } else {
      toast.error(`Maximum ${maxTags} tags allowed`);
    }
  };

  // Handle creating new tag
  const handleCreateTag = async () => {
    if (!searchValueTrimmed || creating) return;

    try {
      setCreating(true);
      const slug = await generateSlugWithFallback(searchValueTrimmed, {
        maxLength: 50,
        fallback: 'new-tag'
      });

      const newTag = await tagService.createTag({
        name: searchValueTrimmed,
        slug: slug,
        description: ""
      });

      // Add to local tags list
      setTags(prev => [...prev, newTag.tag]);
      
      // Add to selected tags
      handleTagToggle(newTag.tag.slug);
      
      setSearchValue("");
      toast.success("Tag created successfully");
    } catch (error) {
      console.error("Failed to create tag:", error);
      toast.error("Failed to create tag");
    } finally {
      setCreating(false);
    }
  };

  // Remove tag from selection
  const handleRemoveTag = (tagSlug: string) => {
    onChange(value.filter(t => t !== tagSlug));
  };

  return (
    <div className="space-y-2">
      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.tagID}
              variant="secondary"
              className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200 transition-colors pr-1"
            >
              <span className="font-medium">{tag.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.slug)}
                disabled={disabled}
                className="ml-1 hover:bg-orange-300 rounded-sm p-0.5 transition-colors"
              >
                <Icons.x className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Tag selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between border-2 border-gray-200 hover:border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100",
              selectedTags.length === 0 && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <div className="flex items-center space-x-2">
              <Icons.tag className="h-4 w-4 text-orange-500" />
              <span>
                {selectedTags.length > 0 
                  ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`
                  : placeholder
                }
              </span>
            </div>
            <Icons.chevronUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search or create tags..." 
              className="border-0 focus:ring-0"
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Loading tags...</span>
                </div>
              ) : (
                <>
                  {/* Create new tag option */}
                  {canCreateNew && (
                    <CommandGroup heading="Create New">
                      <CommandItem
                        onSelect={handleCreateTag}
                        className="flex items-center justify-between cursor-pointer"
                        disabled={creating}
                      >
                        <div className="flex items-center space-x-2">
                          <Icons.plus className="h-4 w-4 text-orange-500" />
                                                     <span>Create &quot;{searchValueTrimmed}&quot;</span>
                        </div>
                        {creating && (
                          <Icons.spinner className="h-4 w-4 animate-spin" />
                        )}
                      </CommandItem>
                    </CommandGroup>
                  )}

                  {/* Existing tags */}
                  <CommandGroup heading="Available Tags">
                    {tags.length === 0 && !loading ? (
                      <CommandEmpty>No tags found.</CommandEmpty>
                    ) : (
                      tags
                        .filter(tag => 
                          !searchValue || 
                          tag.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                          tag.slug.toLowerCase().includes(searchValue.toLowerCase())
                        )
                        .map((tag) => (
                          <CommandItem
                            key={tag.tagID}
                            value={`${tag.slug}-${tag.name}`}
                            onSelect={() => handleTagToggle(tag.slug)}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <Icons.tag className="h-4 w-4 text-orange-500" />
                              <span className="font-medium">{tag.name}</span>
                              <span className="text-xs text-gray-400 font-mono">
                                #{tag.slug}
                              </span>
                            </div>
                            {value.includes(tag.slug) && (
                              <Icons.check className="h-4 w-4 text-orange-600" />
                            )}
                          </CommandItem>
                        ))
                    )}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Tag count indicator */}
      {value.length > 0 && (
        <div className="text-xs text-gray-500">
          {value.length} / {maxTags} tags selected
        </div>
      )}
    </div>
  );
}