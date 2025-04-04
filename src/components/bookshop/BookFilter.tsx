import { BookCategory } from '@/lib/services/bookService';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

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
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(true);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">{t("shop.categories")}</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {expanded && (
        <RadioGroup defaultValue={selectedCategory || ''} className="space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem 
              id="all" 
              value="" 
              checked={selectedCategory === null}
              onClick={() => onCategoryChange(null)}
            />
            <Label htmlFor="all" className="cursor-pointer">
              {t("shop.allCategories")}
            </Label>
          </div>
          
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <RadioGroupItem 
                id={category.id} 
                value={category.id}
                checked={selectedCategory === category.id}
                onClick={() => onCategoryChange(category.id)}
              />
              <Label htmlFor={category.id} className="cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}
    </div>
  );
} 