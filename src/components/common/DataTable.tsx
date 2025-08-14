import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { PageInfo } from '@/types/dto';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: Error | null;
  emptyStateProps?: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
  };
  pageInfo?: PageInfo;
  onPageChange?: (page: number) => void;
  className?: string;
  containerClassName?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  emptyStateProps,
  pageInfo,
  onPageChange,
  className,
  containerClassName,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn('flex justify-center p-8', containerClassName)}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-8', containerClassName)}>
        <EmptyState
          title="Error loading data"
          description={error.message}
          action={{
            label: 'Retry',
            onClick: () => window.location.reload(),
          }}
        />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn('p-8', containerClassName)}>
        <EmptyState
          title={emptyStateProps?.title || 'No data found'}
          description={emptyStateProps?.description}
          icon={emptyStateProps?.icon}
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', containerClassName)}>
      <div className="rounded-lg border overflow-hidden">
        <table className={cn('w-full', className)}>
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-medium',
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-muted/30 transition-colors">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn('px-4 py-3 text-sm', column.className)}
                  >
                    {column.render
                      ? column.render(item)
                      : item[column.key] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageInfo && onPageChange && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Page {pageInfo.page} of {pageInfo.totalPages} ({pageInfo.total} items)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pageInfo.page - 1)}
              disabled={pageInfo.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pageInfo.page + 1)}
              disabled={pageInfo.page >= pageInfo.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}