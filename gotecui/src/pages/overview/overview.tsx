import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Modal } from 'antd';
import { AiFillEdit } from 'react-icons/ai'
import './overview.css';

type ShowTableType = {
  key: any,
  status: boolean,
}
export default function Overview() {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [editedData, setEditedData] = useState<any[]>([]);
  const [switchState, setSwitchState] = useState<boolean[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [header, setHeader] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalRowIndex, setModalRowIndex] = useState<number>(0);
  const [modalCellIndex, setModalCellIndex] = useState<number>(0);
  const [modalInputValue, setModalInputValue] = useState<string>('');
  const [tableShowByKey, setTableShowByKey] = useState<ShowTableType[]>([]);

  useEffect(() => {
    if (Array.isArray(header) && header.length > 0) {
      setSelectedColumns(header);
    }
  }, [header]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        const csvText = reader.result as string;
        Papa.parse(csvText, {
          complete: (results) => {
            const switchStateArray = Array.from(
              { length: results.data.length - 1 },
              () => false
            );
            setHeader(results.data[0] as string[]);
            setCsvData(
              results.data.slice(1).map((row: any, rowIndex: number) => {
                if (row.includes("comment")) {
                  return [...row, switchStateArray[rowIndex]];
                } else {
                  return row;
                }
              })
            );
            setEditedData(results.data.slice(1).map((row: any, rowIndex: number) => {
              if (row.includes("comment")) {
                return [...row, switchStateArray[rowIndex]];
              } else {
                return row;
              }
            }));
            setSwitchState(switchStateArray);
          },
        });
      };
      reader.readAsText(file);
    }
  };


  //Thay đổi từng template [[API_LINK]] => https://www.google.com
  function transformText(
    text: string,
    newValue: string,
    rowIndex: number,
    cellIndex: number
  ) {
    const regex = /\[\[(.*?)\]\]/g;
    const repl = text.replace(regex, (match, template) => {
      if (template === "API_LINK") {
        return newValue;
      } else {
        return match;
      }
    });
    const updatedData = [...editedData];
    updatedData[rowIndex][cellIndex] = repl;
    setEditedData(updatedData);
  }

  //Thay đổi tất cả các template [[API_LINK]] => https://www.google.com
  function transformEditedData() {
    const updatedData = [...editedData];
    updatedData.forEach((row, rowIndex) => {
      row.forEach((cell: any, cellIndex: any) => {
        if (typeof cell === "string") {
          const regex = /\[\[(.*?)\]\]/g;
          const repl = cell.replace(regex, (match, template) => {
            if (template === "API_LINK") {
              return "https://www.google.com";
            } else {
              return match;
            }
          });
          updatedData[rowIndex][cellIndex] = repl;
        }
      });
    });
    setEditedData(updatedData);
  }

  const handleCellEdit = (
    newValue: string,
    rowIndex: number,
    cellIndex: number
  ) => {
    const updatedData = [...editedData];
    updatedData[rowIndex][cellIndex] = newValue;
    setEditedData(updatedData);
  };

  const handleSwitchChange = (rowIndex: number) => {
    const updatedSwitchState = [...switchState];
    updatedSwitchState[rowIndex] = !updatedSwitchState[rowIndex];
    setSwitchState(updatedSwitchState);

    const updatedEditedData = [...editedData];
    const commentIndex = updatedEditedData[rowIndex].findIndex((cell: any) => cell.includes("comment")) + 1;
    if (commentIndex !== -1) {
      const comment = updatedEditedData[rowIndex][commentIndex];
      if (updatedSwitchState[rowIndex]) {
        updatedEditedData[rowIndex][commentIndex] = `${comment} [ADD]`;
      } else {
        updatedEditedData[rowIndex][commentIndex] = comment.replace(" [ADD]", "");
      }
      setEditedData(updatedEditedData);
    }
  };
  const handleRestoreAllColumns = () => {
    setSelectedColumns(header);
  };

  const handleRemoveColumn = (columnName: string) => {
    setSelectedColumns((prevSelectedColumns) =>
      prevSelectedColumns.filter((column) => column !== columnName)
    );
  };
  const handleSave = () => {
    const filteredData = editedData.map((row) =>
      row.map((value: any, index: number) =>
        selectedColumns.includes(header[index]) && value !== "" ? value : null
      )
    );

    const selectedHeader = header.filter((column: any) =>
      selectedColumns.includes(column)
    );
    const selectedData = filteredData.filter((row) =>
      row.some((cell: any) => cell !== "")
    );
    const newData = [selectedHeader, ...selectedData];
    const removeHeader = newData.slice(1);
    removeHeader.unshift(header)
    const csvString = Papa.unparse(removeHeader, { quotes: true });

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "edited.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleModalOpen = (rowIndex: number, cellIndex: number) => {
    const cellValue = editedData[rowIndex][cellIndex];
    setModalInputValue(cellValue);
    setModalRowIndex(rowIndex);
    setModalCellIndex(cellIndex);
    setModalVisible(true);
  };
  const handleModalClose = () => {
    setModalVisible(false);
  };
  const handleModalSave = (newValue: string) => {
    const updatedData = [...editedData];
    updatedData[modalRowIndex][modalCellIndex] = newValue;
    setEditedData(updatedData);
    setModalVisible(false);
  };
  // const handleExport = () => {
  //   const selectedData = editedData.slice(1).filter((row) => row.some((cell: any) => cell !== "" || cell !== ''));
  //   const newData = selectedData.map((row) => {
  //     const obj: any = {};
  //     for (let i = 2; i < row.length; i++) {
  //       obj[selectedColumns[i]] = row[i].replace(/\r\n/g, '\n');
  //     }
  //     return obj;
  //   });

  //   const yamlString = jsyaml.dump(newData);
  //   const blob = new Blob([yamlString], { type: "text/yaml;charset=utf-8;" });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.setAttribute("download", "data.yaml");
  //   document.body.appendChild(link);
  //   link.click();
  // };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const textarea = event.target as HTMLTextAreaElement;
      const { selectionStart, value } = textarea;
      const lines = value.split('\n');
      const currentLineIndex = lines.findIndex((line) => selectionStart! >= line.length);
      const currentLine: any = lines[currentLineIndex] ?? '';
      const indentation = currentLine.match(/^\s*/)[0];
      const newLine = indentation + value.slice(selectionStart!);
      const newValue = value.slice(0, selectionStart!) + '\n' + newLine;
      setModalInputValue(newValue);

      setTimeout(() => {
        textarea.selectionStart = selectionStart! + indentation.length + 1;
        textarea.selectionEnd = selectionStart! + indentation.length + 1;
        textarea.focus();
      }, 0);
    }
  };

  const handleSetGroupTable = (newValue: ShowTableType) => {
    const existValue = tableShowByKey.some((element) => element.key === newValue.key);
    const updatedData = [...tableShowByKey];
    if (existValue) {
      const removeValue = updatedData.filter((element) => element.key !== newValue.key);
      setTableShowByKey(removeValue);
    } else {
      setTableShowByKey(prev => [...prev, newValue]);
    }
  }

  console.log(tableShowByKey);
  return (
    <div>
      <div className='header-action'>
        <div className='frame-input-file'>
          <input className='open-file' id='select-file' type="file" accept=".csv" onChange={handleFileUpload} />
        </div>
        <button className='button' onClick={transformEditedData}>Template</button>
        <button className='button' onClick={handleSave}>Export CSV</button>
        {/* <button className='button' onClick={handleExport}>Export YAML</button> */}
        <button className='button' onClick={handleRestoreAllColumns}>Restore all columns </button>
      </div>
      {Array.isArray(header) && header.length > 0 &&
        <div className='frame-header-row' style={{ gridTemplateColumns: `repeat(${selectedColumns.length + 1}, minmax(0, 1fr))` }}>
          {selectedColumns.map((cell: any, cellIndex: any) => (
            <div className='item-header-row' key={cellIndex}>
              <button className='button' onClick={() => handleRemoveColumn(cell)}>
                {cell.charAt(0).toUpperCase() + cell.slice(1)}
              </button>
            </div>
          ))}
          <div className='item-header-row'>
            Add comment
          </div>
        </div>
      }
      {Array.isArray(header) && header.length > 0 &&
        <div className='frame-header-row' style={{ gridTemplateColumns: `repeat(${header.length}, minmax(0, 1fr))` }}>
          {header.slice(1).map((cell: any, cellIndex: any) => (
            <div className='item-header-row' key={cellIndex}>
              <button className='button'>
                {cell.charAt(0).toUpperCase() + cell.slice(1)}
              </button>
            </div>
          ))}
          <div className='item-header-row'>
            Add comment
          </div>
        </div>
      }
      <table className='frame-table'>
        <tbody className='tbody'>
          {Array.isArray(csvData) && csvData.length > 1
            &&
            editedData.map((row: any[], rowIndex: any) => (
              <tr key={rowIndex} className='item-content-row'
                style={{
                  gridTemplateColumns: `repeat(${header.length}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(2, 1fr)`,
                  gap: '1rem'
                }}>
                {Array.isArray(row) && row.length > 0
                  &&
                  row.map((cell: any, cellIndex: any) => {
                    if (cellIndex === row.length - 1 && row.includes('comment')) {
                      return (
                        cellIndex === 0
                          ? <div className='title'
                            onClick={() => handleSetGroupTable({ key: cell + `${rowIndex}/${cellIndex}`, status: true })}
                            style={{
                              gridRow: '1',
                              gridColumn: `span ${header.length} / span ${header.length}`
                            }}>{cell}</div>
                          : <td style={{ gridRow: '2' }} key={`${rowIndex}-${cellIndex}`} className='item-content input'>
                            <input
                              type="checkbox" checked={switchState[rowIndex]} onChange={() => handleSwitchChange(rowIndex)}
                            />
                          </td>
                      );
                    } else {
                      return (
                        cellIndex === 0
                          ? <div className='title'
                            onClick={() => handleSetGroupTable({ key: cell + `${rowIndex}/${cellIndex}`, status: true })}
                            style={{
                              gridRow: '1',
                              gridColumn: `span ${header.length} / span ${header.length}`
                            }}>{cell}</div>
                          : <td style={{
                            gridRow: '2',
                            backgroundColor: rowIndex % 2 === 0 ? '#161616' : '#363535',
                          }} key={`${rowIndex}-${cellIndex}`} className='item-content'>
                            <input
                              style={{
                                color: cell.includes('[[API_LINK]]') ? 'blue' : 'white',
                                backgroundColor: rowIndex % 2 === 0 ? '#161616' : '#363535'
                              }}
                              type="text"
                              value={editedData[rowIndex][cellIndex]}
                              onChange={(event) => handleCellEdit(event.target.value, rowIndex, cellIndex)}
                            />
                            <button className='button-edit-field' onClick={() => handleModalOpen(rowIndex, cellIndex)}>
                              <AiFillEdit />
                            </button>
                          </td>
                      );
                    }
                  })
                }
              </tr>
            ))
          }
        </tbody>
      </table>
      <Modal
        visible={modalVisible}
        onCancel={handleModalClose}
        onOk={() => handleModalSave(modalInputValue)}
        className='edit-modal'
      >
        <label>
          Edit data
        </label>
        <textarea
          key='textarea-field'
          value={modalInputValue}
          onChange={(event) => setModalInputValue(event.target.value)}
          rows={20}
          onKeyDown={handleKeyDown}
        />
      </Modal>
    </div>
  );
}
