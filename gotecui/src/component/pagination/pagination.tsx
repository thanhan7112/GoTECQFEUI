import React, { useState, useEffect } from 'react';
import { GrFormPrevious, GrFormNext } from 'react-icons/gr'
import './pagination.css'

interface Props {
  pageCount: number;
  onPageChange: (selectedPage: number) => void;
  initialPage?: number;
}

const Pagination: React.FC<Props> = ({ pageCount, onPageChange, initialPage = 1 }) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [inputPage, setInputPage] = useState(initialPage + 1);
  const [endPage, setEndPage] = useState(5);
  const [startPage, setStartPage] = useState(0)

  useEffect(() => {
    setCurrentPage(initialPage);
    setInputPage(initialPage + 1);
    if(currentPage >= 3){
      setEndPage(currentPage + 3)
      setStartPage(currentPage - 2)
    }else{
      setEndPage(5);
      setStartPage(0);
    }
  }, [currentPage, initialPage]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    onPageChange(pageNumber);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(Number(event.target.value));
  };

  const handleInputBlur = () => {
    if (inputPage < 1) {
      setInputPage(1);
    } else if (inputPage > pageCount) {
      setInputPage(pageCount);
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const pageNumber = inputPage - 1;
      if(pageNumber < 0){
        handlePageChange(inputPage)
      }else{
        handlePageChange(pageNumber);
      }
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 0; i < pageCount; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers.slice(startPage, endPage).map((pageNumber) => (
      <div
        key={pageNumber}
        className={`page-item ${pageNumber === currentPage ? 'active' : ''}`}
        onClick={() => handlePageChange(pageNumber)}
      >
        <button className="page-link">{pageNumber + 1}</button>
      </div>
    ));
  };

  return (
    <div className='class-pagination-action'>
      <div className={'page-item'}>
        {currentPage === 0
          ? <button className="page-link disabled">
            <GrFormPrevious />
          </button>
          : <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
            <GrFormPrevious stroke='white' />
          </button>
        }
      </div>
      {renderPageNumbers()}
      <div className={'page-item'}>
        {currentPage === pageCount - 1
          ? <button className="page-link disabled">
             <GrFormNext />
          </button>
          : <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
             <GrFormNext />
          </button>
        }
      </div>
      <div className='jump-page'>
        <input
          type="number"
          className="form-control"
          min={1}
          max={pageCount}
          value={inputPage}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
        />
        <button className="btn btn-primary" onClick={() => handlePageChange(inputPage - 1)}>
          Go
        </button>
      </div>
    </div>
  );
};

export default Pagination;
