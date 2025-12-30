import { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Calendar, Clock, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  date: Date;
  onChange: (date: Date) => void;
}

export function DateTimePicker({ date, onChange }: DateTimePickerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [timeValue, setTimeValue] = useState(format(date, 'HH:mm'));

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const updated = new Date(date);
      updated.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      onChange(updated);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTimeValue(value);
    
    const [hours, minutes] = value.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      const updated = new Date(date);
      updated.setHours(hours, minutes);
      onChange(updated);
    }
  };

  const setToNow = () => {
    const now = new Date();
    onChange(now);
    setTimeValue(format(now, 'HH:mm'));
    setIsEditing(false);
  };

  return (
    <motion.div
      className="section-card flex items-center justify-between gap-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(date, 'MMM d')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <Input
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              className="w-24 h-9 text-center input-field"
            />
          </div>
        ) : (
          <div className="flex flex-col">
            <span className="text-lg font-semibold">
              {format(date, 'h:mm a')}
            </span>
            <span className="text-sm text-muted-foreground">
              {format(date, 'EEEE, MMMM d')}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={setToNow}
            className="text-primary"
          >
            Now
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
          className={cn(isEditing && 'text-primary')}
        >
          <Edit3 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
