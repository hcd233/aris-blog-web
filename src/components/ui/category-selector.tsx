"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
import { categoryService } from "@/services/category.service";
import type { Category } from "@/types/api/category.types";
import { toast } from "sonner";

interface CategorySelectorProps {
  value: number;
  onChange: (categoryID: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CategorySelector({
  value,
  onChange,
  placeholder = "Select category...",
  disabled = false,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Load categories when component mounts or popover opens
  const loadCategories = useCallback(async () => {
    if (categories.length > 0) return; // Already loaded

    try {
      setLoading(true);
      const categoryTree = await categoryService.getCategoryTree();
      setCategories(categoryTree);
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [categories.length]);

  // Load categories when popover opens
  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open, loadCategories]);

  // Find and set selected category when value changes
  useEffect(() => {
    if (value && categories.length > 0) {
      const category = categories.find(cat => cat.categoryID === value);
      setSelectedCategory(category || null);
    } else {
      setSelectedCategory(null);
    }
  }, [value, categories]);

  // Recursively render category tree structure
  const renderCategoryTree = (categoryList: Category[], level = 0) => {
    return categoryList.map((category) => (
      <CommandItem
        key={category.categoryID}
        value={`${category.categoryID}-${category.name}`}
        onSelect={() => {
          onChange(category.categoryID);
          setOpen(false);
        }}
        className={cn(
          "flex items-center justify-between cursor-pointer",
          level > 0 && "ml-4"
        )}
      >
        <div className="flex items-center space-x-2">
          <Icons.folder className={cn(
            "h-4 w-4 text-purple-500",
            level > 0 && "h-3 w-3"
          )} />
          <span className={cn(
            "font-medium",
            level > 0 && "text-sm text-gray-600"
          )}>
            {category.name}
          </span>
          <span className="text-xs text-gray-400 font-mono">
            #{category.categoryID}
          </span>
        </div>
        {value === category.categoryID && (
          <Icons.check className="h-4 w-4 text-purple-600" />
        )}
      </CommandItem>
    ));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between border-2 border-gray-200 hover:border-purple-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-100",
            !selectedCategory && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <div className="flex items-center space-x-2">
            {selectedCategory ? (
              <>
                <Icons.folder className="h-4 w-4 text-purple-500" />
                <span className="font-medium">{selectedCategory.name}</span>
                <span className="text-xs text-gray-400 font-mono">
                  #{selectedCategory.categoryID}
                </span>
              </>
            ) : (
              <>
                <Icons.folder className="h-4 w-4 text-gray-400" />
                <span>{placeholder}</span>
              </>
            )}
          </div>
          <Icons.chevronUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search categories..." 
            className="border-0 focus:ring-0"
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Loading categories...</span>
              </div>
            ) : (
              <>
                <CommandEmpty>No categories found.</CommandEmpty>
                <CommandGroup>
                  {renderCategoryTree(categories)}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}