
import React from 'react';
import ReactPaginate from 'react-paginate';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageClick = (event) => {
    onPageChange(event.selected + 1);
  };

  return (
    <div className="flex justify-center">
      <ReactPaginate
        breakLabel="..."
        nextLabel="Next"
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={totalPages}
        previousLabel="Previous"
        forcePage={currentPage - 1}
        renderOnZeroPageCount={null}
        className="flex items-center space-x-2"
        pageClassName="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
        pageLinkClassName="block"
        activeClassName="bg-blue-500 text-white rounded-md"
        previousClassName="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
        nextClassName="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
        disabledClassName="opacity-50 cursor-not-allowed"
        breakClassName="px-3 py-2 text-sm font-medium text-gray-500"
      />
    </div>
  );
};

export default Pagination;
