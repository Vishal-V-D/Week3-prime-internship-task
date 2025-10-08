import React from 'react';
import type { IconType } from 'react-icons';


export type DataItem = Record<string, any>;
export type SortOrder = 'ASC' | 'DESC';

export interface Column<T extends DataItem> {
  key: keyof T | 'actions';
  header: string;
  isSortable?: boolean;
  render: (item: T, icons: { FaEdit: IconType; FaTrash: IconType; }) => React.ReactNode; 
}

export interface GenericTableProps<T extends DataItem> {
  data: T[];
  columns: Column<T>[];
  isLoading: boolean;
  
  totalItems?: number;
  limit?: number;
  page?: number;
  setPage?: (page: number) => void;
  search: string;
  setSearch: (search: string) => void; 
  searchPlaceholder: string;

  sortField: string;
  sortOrder: SortOrder;
  handleSort: (field: string) => void;

  hasCreateButton?: boolean;
  onCreate?: () => void;
  createButtonLabel?: string;
  
  FaPlus: IconType; 
  FaEdit: IconType;
  FaTrash: IconType;
  isActionPending?: boolean;
}



function GenericTable<T extends DataItem>({
  data,
  columns,
  isLoading,
  totalItems,
  limit = 10,
  page = 1,
  setPage,
  search,
  setSearch,
  searchPlaceholder,
  sortField,
  sortOrder,
  handleSort,
  hasCreateButton,
  onCreate,
  createButtonLabel = "Add New",
  FaPlus,
  FaEdit,
  FaTrash,
  isActionPending = false,
}: GenericTableProps<T>): React.ReactElement {

  const totalPages = totalItems ? Math.ceil(totalItems / limit) : 1;
  const showingFrom = totalItems ? (page - 1) * limit + 1 : 0;
  const showingTo = totalItems ? Math.min(page * limit, totalItems) : 0;

  
  const subBgClass = 'bg-[hsla(var(--color-text-primary),0.03)]';
  const subHoverClass = 'hover:bg-[hsla(var(--color-text-primary),0.07)]';


  return (
    <div className="w-full">
 
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1">
       
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            
            className={`w-full pl-10 pr-4 py-2.5 bg-theme-secondary border border-theme rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-accent))] focus:border-[hsl(var(--color-accent-hover))] transition-shadow text-sm text-theme-primary`}
          />
        </div>
        {hasCreateButton && onCreate && (
         
          <button 
            onClick={onCreate} 
            disabled={isActionPending}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 
              bg-[hsl(var(--color-accent))] hover:bg-[hsl(var(--color-accent-hover))] active:bg-[hsl(var(--color-accent-hover))]
              text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm text-sm whitespace-nowrap
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <FaPlus className="w-4 h-4" /> 
            {createButtonLabel}
          </button>
        )}
      </div>

 
      <div className="bg-theme-secondary rounded-xl shadow-sm border border-theme overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
           
            {[...Array(limit)].map((_, idx) => (
              <div key={idx} className="h-12 bg-[hsla(var(--color-text-primary),0.05)] rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
          
            <div className="overflow-x-auto">
         
              <table className="w-full min-w-full">
                <thead>

                  <tr className={`${subBgClass} border-b border-theme`}>
                    {columns.map((col) => (
                      <th
                        key={String(col.key)}

                        className={`px-6 py-3.5 text-left text-xs font-semibold text-theme-primary uppercase tracking-wider whitespace-nowrap
                          ${col.isSortable ? 'cursor-pointer select-none transition-colors' : ''}
                          ${col.isSortable ? subHoverClass : ''}
                        `}
                        onClick={() => col.isSortable && handleSort(String(col.key))}
                      >
                        <div className="flex items-center gap-2">
                          {col.header}
                          {col.isSortable && sortField === col.key && (
                       
                            <span className="text-[hsl(var(--color-accent))]">
                              {sortOrder === "ASC" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme">
                  {data.length > 0 ? (
                    data.map((item, index) => (
                      <tr 
                        key={item.id || index} 
                       
                        className={`transition-colors ${subHoverClass}`}
                      >
                        {columns.map((col) => (
                         
                          <td key={String(col.key)} className="px-6 py-4 text-sm text-theme-primary whitespace-nowrap">
                            {col.render(item as T, { FaEdit, FaTrash })}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                        
                          <svg className="w-12 h-12 text-[hsl(var(--color-border))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                       
                          <p className="text-theme-secondary font-medium">No items found</p>
                          <p className="text-[hsla(var(--color-text-secondary),0.7)] text-xs">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          
            {setPage && totalItems !== undefined && totalItems > 0 && (
              <div className={`px-6 py-4 ${subBgClass} border-t border-theme`}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-theme-primary">
                    Showing <span className="font-medium">{showingFrom}</span> to <span className="font-medium">{showingTo}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> results
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      disabled={page <= 1} 
                      onClick={() => setPage(page - 1)} 
                      className={`px-3 py-2 text-sm font-medium text-theme-primary bg-theme-secondary border border-theme rounded-lg ${subHoverClass} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = idx + 1;
                        } else if (page <= 3) {
                          pageNum = idx + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + idx;
                        } else {
                          pageNum = page - 2 + idx;
                        }
                        
                    
                        if (pageNum < 1 || pageNum > totalPages) return null;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              
                              page === pageNum
                                ? 'bg-[hsl(var(--color-accent))] text-white'
                               
                                : `text-theme-primary ${subHoverClass}`
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button 
                      disabled={page >= totalPages} 
                      onClick={() => setPage(page + 1)} 
                      className={`px-3 py-2 text-sm font-medium text-theme-primary bg-theme-secondary border border-theme rounded-lg ${subHoverClass} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default GenericTable;
