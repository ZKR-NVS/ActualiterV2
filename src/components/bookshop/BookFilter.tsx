import { BookCategory } from '@/lib/services/bookService';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface BookFilterProps {
  categories: BookCategory[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export default function BookFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: BookFilterProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Catégories</h3>
      
      <RadioGroup 
        value={selectedCategory || ''} 
        onValueChange={(value) => onCategoryChange(value || null)}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="" id="all-categories" />
          <Label htmlFor="all-categories" className="cursor-pointer">
            Toutes les catégories
          </Label>
        </div>
        
        {categories.map((category) => (
          <div key={category.id} className="flex items-center space-x-2">
            <RadioGroupItem value={category.id as string} id={`category-${category.id}`} />
            <Label htmlFor={`category-${category.id}`} className="cursor-pointer flex-1">
              <div className="flex justify-between">
                <span>{category.name}</span>
                {category.count !== undefined && (
                  <span className="text-muted-foreground text-xs">{category.count}</span>
                )}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
} 