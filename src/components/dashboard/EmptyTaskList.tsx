
import React from 'react';
import { Button } from '@/components/ui/button';
import { ListChecks, Plus } from 'lucide-react';
import { TaskPriority, TaskStatus } from './TaskTypes';

interface EmptyTaskListProps {
  filter: 'all' | TaskStatus;
  priorityFilter: 'all' | TaskPriority;
  onCreateTask: () => void;
  canCreateTask: boolean;
}

export function EmptyTaskList({ filter, priorityFilter, onCreateTask, canCreateTask }: EmptyTaskListProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-5 rounded-full bg-muted/30 mb-3">
        <ListChecks className="h-8 w-8 text-muted-foreground opacity-40" />
      </div>
      <p className="text-muted-foreground text-lg">No tasks found</p>
      <p className="text-muted-foreground/70 text-sm max-w-md mt-1">
        {filter !== 'all' || priorityFilter !== 'all' 
          ? "Try changing your filters or" 
          : "Get started by"
        } creating a new task
      </p>
      {canCreateTask && (
        <Button 
          variant="outline" 
          className="mt-5 gap-2 bg-card" 
          onClick={onCreateTask}
        >
          <Plus className="h-4 w-4" />
          Create a task
        </Button>
      )}
    </div>
  );
}
