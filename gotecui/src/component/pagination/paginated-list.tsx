import React, { useState, useMemo } from 'react';
import Pagination from './pagination';
import { AiOutlineCheckCircle } from 'react-icons/ai'
import { BiSearch } from 'react-icons/bi'
import './pagination.css'
import { IData } from 'modal/modal';

const PaginatedList = () => {
  const [data, setData] = useState<IData[]>([]);
  const [disabledColumns, setDisabledColumns] = useState<number[]>([]);
  // const [searchQuery, setSearchQuery] = useState<string>("");
  const [header, setHeader] = useState<string[]>()

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, _] = useState(22);

  function handleFileSelect(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const csvData = reader.result?.toString();
        const rows = csvData?.split("\n");
        const header = rows?.[0]?.split(",") ?? [];
        setHeader(header);
        // const developIndex = header!.indexOf('"develop"') ?? 1;
        const endIndex = (header?.length ?? 0) - 1;
        const result: any[] = [];
        for (let i = 1; i < rows!.length; i++) { // i = 1 sẽ loại bỏ header
          const row = rows![i].split(",");
          const obj: { [key: string]: string } = {};
          for (let j = 0; j <= endIndex; j++) { // j = developIndex, cột đầu tiên sẽ từ develop và loại bỏ các dòng trước đó
            if (row[j] !== undefined) {
              obj[header![j]] = row[j].replace('\r', '');
            }
          }
          result.push(obj);
        }
        setData(result);
      };
      reader.readAsText(file);
    }
  }

  const handlePageChange = (selectedPage: number) => {
    setCurrentPage(selectedPage);
  };

  function handleColumnToggle(columnIndex: number) {
    setDisabledColumns(prevDisabledColumns => {
      if (prevDisabledColumns.includes(columnIndex)) {
        return prevDisabledColumns.filter(index => index !== columnIndex);
      } else {
        return [...prevDisabledColumns, columnIndex];
      }
    });
  }

  function isColumnDisabled(columnIndex: number) {
    return disabledColumns.includes(columnIndex);
  }

  const handleDownload = () => {
    const csvContent = data.map(row =>
      Object.entries(row)
        .map(([property, value]) => {
          const columnIndex = header!.indexOf(property);
          return isColumnDisabled(columnIndex) ? '' : `${value?.replace('\r', '')}`;
        })
        .join(",")
    ).join("\n");
    const blob = new Blob([header + "\n" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);
    link.click();
    link.addEventListener("load", () => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };


  function handleDataChange(rowIndex: number, columnIndex: number, value: string) {
    console.log(value === "" ? true : false);
    setData(prevData => {
      const newData = prevData.map(row => ({ ...row }));
      const propertyNames = Object.keys(newData[rowIndex]);
      const propertyName = propertyNames[columnIndex];
      if(value === ""){
        newData[rowIndex] = { ...newData[rowIndex], [propertyName]: `${value}` };
      }else{
        newData[rowIndex] = { ...newData[rowIndex], [propertyName]: `"${value}"` };
      }
      return newData;
    });
  }

  const offset = currentPage * itemsPerPage;
  const pagedItems = useMemo(() => {
    const startIndex = offset;
    const endIndex = offset + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [offset, itemsPerPage, data]);

  return (
    <div className='overview-main'>
      <div className='environment'>
        <div className='title-environment'>
          <p>Overview</p>
          <div className='title-environment-right'>
            <div className='frame-input'>
              <BiSearch className='icon-search-header' />
              <input className='input-header' placeholder='Search or type a command'/>
                {/* <input className='input-header' placeholder='Search or type a command' value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} /> */}
            </div>
            <div className='div-button'>
              <label htmlFor="fileInput">
                <div className='div-child-label'>
                  <p className="format-text">Select file</p>
                </div>
              </label>
              <input type="file" id='fileInput' className='custom-file-input' onChange={handleFileSelect} />
            </div>
          </div>
        </div>
        <div className='class-page-main'>
          <button className='button-dowload' onClick={handleDownload}>Export</button>
          <div className='class-classify-main item'>
            <div className='class-classify'>
              {header && Object.values(header).map((ele: any, columnIndex) => (
                <div className='classify-item single item'>
                  <div className='classify-item-single-frame'>
                    <span>{ele.replaceAll('"', '').charAt(0).toUpperCase() + ele.replaceAll('"', '').slice(1)}</span>
                    <span className='span-block-center'>
                      <div className='frame-icon-check' onClick={() => handleColumnToggle(columnIndex)} style={{ backgroundColor: isColumnDisabled(columnIndex) ? "" : "#0052CC" }}>
                        <AiOutlineCheckCircle />
                      </div>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {pagedItems.map((row: any, rowIndex: any) => (
            <div className='class-classify-main item'>
              <div className='class-classify'>
                {Object.keys(row).map((property, columnIndex) => (
                  <div className='classify-item single item'>
                    {!isColumnDisabled(columnIndex) && (
                      <input value={row[property].replaceAll('"', '')}
                        onChange={(event) => handleDataChange(rowIndex, columnIndex, event.target.value)} />
                    )}
                    {isColumnDisabled(columnIndex) && (
                      <input value='Disable' className='disable'
                        onChange={(event) => handleDataChange(rowIndex, columnIndex, '')} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Pagination
            pageCount={Math.ceil(data.length / itemsPerPage)}
            onPageChange={handlePageChange}
            initialPage={currentPage}
          />
        </div>
      </div>
    </div>

  );
};
export default PaginatedList;
