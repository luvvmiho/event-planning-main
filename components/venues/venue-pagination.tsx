"use client"

import { useQueryStates } from "nuqs"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { venueSearchParamsParsers } from "@/lib/venue-search-params"

interface VenuePaginationProps {
  currentPage: number
  totalPages: number
}

export function VenuePagination({
  currentPage,
  totalPages,
}: VenuePaginationProps) {
  const [, setParams] = useQueryStates(venueSearchParamsParsers)

  const handlePageChange = (page: number) => {
    void setParams({ page })
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push("...")
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push("...")
      }

      pages.push(totalPages)
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-1 pt-8">
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      {getPageNumbers().map((page, index) => (
        <div key={index}>
          {page === "..." ? (
            <span className="flex h-10 w-10 items-center justify-center text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              variant={currentPage === page ? "default" : "outline"}
              className={cn(
                "h-10 w-10",
                currentPage === page && "bg-primary text-primary-foreground",
              )}
              onClick={() => handlePageChange(page as number)}
            >
              {page}
            </Button>
          )}
        </div>
      ))}

      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  )
}
