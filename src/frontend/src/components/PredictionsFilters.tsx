import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface PredictionsFiltersProps {
  sport: string;
  onSportChange: (sport: string) => void;
  sortOrder: 'newest' | 'oldest';
  onSortOrderChange: (order: 'newest' | 'oldest') => void;
}

export default function PredictionsFilters({
  sport,
  onSportChange,
  sortOrder,
  onSortOrderChange,
}: PredictionsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 space-y-2">
        <Label htmlFor="sport-filter">Sport</Label>
        <Select value={sport} onValueChange={onSportChange}>
          <SelectTrigger id="sport-filter">
            <SelectValue placeholder="All Sports" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            <SelectItem value="nba">NBA</SelectItem>
            <SelectItem value="nfl">NFL</SelectItem>
            <SelectItem value="mlb">MLB</SelectItem>
            <SelectItem value="nhl">NHL</SelectItem>
            <SelectItem value="ncaaf">NCAAF</SelectItem>
            <SelectItem value="ncaabb">NCAABB</SelectItem>
            <SelectItem value="soccer">Soccer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 space-y-2">
        <Label htmlFor="sort-filter">Sort By</Label>
        <Select value={sortOrder} onValueChange={(v) => onSortOrderChange(v as 'newest' | 'oldest')}>
          <SelectTrigger id="sort-filter">
            <SelectValue placeholder="Sort by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
