import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface PaginationProps {
  lastPage: number;
  onPageChange: (page: number) => void;
}
const Pagination: React.FC<PaginationProps> = ({ lastPage, onPageChange }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < lastPage) {
      setCurrentPage(currentPage + 1);
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    onPageChange(page);
  };

  // Function to generate pagination numbers with ellipsis for large datasets
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const siblingCount = 1; // Number of pages to show around current page

    if (lastPage <= 7) {
      // If less than 7 pages, show all pages
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      // Always show first, last, and nearby pages
      pages.push(1);
      if (currentPage > siblingCount + 2) pages.push("...");
      for (
        let i = Math.max(2, currentPage - siblingCount);
        i <= Math.min(lastPage - 1, currentPage + siblingCount);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < lastPage - siblingCount - 1) pages.push("...");
      pages.push(lastPage);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex justify-center select-none h-[28px] text-sm gap-x-1 text-primary-foreground">
      {/* Previous Button */}
      <ChevronLeft
        onClick={() => {
          if (currentPage !== 1) handlePrevPage();
        }}
        className={`size-8 rounded transition-colors cursor-pointer rtl:rotate-180 self-center p-2 ${
          currentPage === 1
            ? "text-primary/50"
            : "text-primary hover:bg-fourth/10"
        }`}
      />
      {/* Page Numbers */}
      {pageNumbers.map((page, index) =>
        typeof page === "number" ? (
          <button
            key={index}
            onClick={() => handlePageClick(page)}
            className={`min-w-8 px-[2px] cursor-pointer rounded transition-colors ${
              currentPage === page
                ? "bg-fourth text-primary-foreground text-[14px]"
                : "text-secondary-foreground hover:bg-fourth/10 text-[12px] font-semibold"
            }`}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-4 py-2 text-primary">
            ...
          </span>
        )
      )}

      {/* Next Button */}

      <ChevronRight
        onClick={() => {
          if (currentPage !== lastPage) handleNextPage();
        }}
        className={`size-8 rounded transition-colors cursor-pointer rtl:rotate-180 self-center p-2 ${
          currentPage !== lastPage
            ? "text-primary hover:bg-fourth/10"
            : "text-primary/50"
        }`}
      />
    </div>
  );
};

export default Pagination;
