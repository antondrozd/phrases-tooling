// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  IconButton,
  Collapse,
  TablePagination,
  TableContainer,
  Paper,
  Select,
  MenuItem,
  TextField,
  Chip,
  Box,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Edit,
  Done,
  Delete,
  Cancel,
} from "@mui/icons-material";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { type LocalizationRow } from "./types";
import { data, namespaces } from "./data";
import ExpandedView from "./ExpandedView";
import TopPanel from "./TopPanel";

const columnHelper = createColumnHelper<LocalizationRow>();

const columns = [
  columnHelper.accessor("phraseKey", {
    header: "Phrase Key",
    cell: (info) => <Chip label={info.getValue()} />,
  }),
  columnHelper.accessor("namespace", {
    header: "Namespace",
    cell: (info) => info.getValue() || "No namespace",
  }),
  columnHelper.accessor("defaultTranslation", {
    header: "Default Translation (English)",
  }),
  columnHelper.accessor("description", {
    header: "Description",
  }),
  columnHelper.accessor("screenshot", {
    header: "Screenshot",
    cell: (info) => {
      const url = info.getValue();

      return url ? (
        <img
          src={info.getValue()}
          alt="screenshot"
          style={{ width: 50, height: 50 }}
        />
      ) : null;
    },
  }),
];

const LocalizationManager = () => {
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [editingRows, setEditingRows] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [editedData, setEditedData] = useState<{
    [key: string]: LocalizationRow;
  }>({});
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [filterMissingTranslations, setFilterMissingTranslations] =
    useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const phraseKeyRef = useRef<HTMLInputElement | null>(null);
  const [localData, setLocalData] = useState<LocalizationRow[]>(data);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleMissingTranslationsToggle = () => {
    setFilterMissingTranslations((prev) => !prev);
  };

  const filteredData = useMemo(() => {
    return localData.filter((row) => {
      const matchesSearchTerm = row.phraseKey
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesNamespace =
        selectedNamespaces.length === 0 ||
        selectedNamespaces.includes(row.namespace || "");
      const hasMissingTranslations = Object.values(row.translations).some(
        (translation) => translation.trim() === ""
      );
      const matchesMissingTranslations =
        !filterMissingTranslations || hasMissingTranslations;

      return (
        (matchesSearchTerm && matchesNamespace && matchesMissingTranslations) ||
        editingRows[row.id]
      );
    });
  }, [
    localData,
    searchTerm,
    selectedNamespaces,
    filterMissingTranslations,
    editingRows,
  ]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      pagination: { pageIndex: page, pageSize: rowsPerPage },
    },
    onSortingChange: setSorting,
  });

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleEditing = (id: string) => {
    const row = localData.find((r) => r.id === id);
    setEditedData((prev) => ({
      ...prev,
      [id]: { ...row },
    }));
    setEditingRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCancelEdit = (id: string) => {
    setLocalData((prevData) =>
      prevData.map((row) => (row.id === id ? editedData[id] : row))
    );
    setEditingRows((prev) => ({
      ...prev,
      [id]: false,
    }));
  };

  // const handleSaveEdit = (id: string) => {
  //   setEditingRows((prev) => ({
  //     ...prev,
  //     [id]: false,
  //   }));
  //   setEditedData((prev) => {
  //     const updatedData = { ...prev };
  //     delete updatedData[id];
  //     return updatedData;
  //   });
  // };

  const handleRowChange = (
    id: string,
    field: keyof LocalizationRow,
    value: string
  ) => {
    const updatedData = [...localData];
    const rowIndex = localData.findIndex((row) => row.id === id);
    updatedData[rowIndex] = { ...updatedData[rowIndex], [field]: value };
    setLocalData(updatedData);
  };

  const handleTranslationChange = (
    phraseKey: string,
    language: string,
    value: string
  ) => {
    const updatedData = [...localData];
    const rowIndex = localData.findIndex((row) => row.phraseKey === phraseKey);
    updatedData[rowIndex].translations[language] = value;
    setLocalData(updatedData);
  };

  const handleDeleteRow = (phraseKey: string) => {
    const updatedData = localData.filter((row) => row.phraseKey !== phraseKey);
    setLocalData(updatedData);
  };

  const handleAddPhrase = () => {
    const id = Date.now().toString();
    const newPhrase: LocalizationRow = {
      phraseKey: "",
      defaultTranslation: "",
      description: "",
      screenshot: "",
      translations: { fr: "", de: "", es: "", ar: "" },
      namespace: null,
      id,
    };

    setLocalData((prev) => [...prev, newPhrase]);
    setPage(Math.ceil((localData.length + 1) / rowsPerPage) - 1);
    setExpandedRows((prev) => ({
      ...prev,
      [id]: true,
    }));
    setEditingRows((prev) => ({
      ...prev,
      [id]: true,
    }));
    phraseKeyRef.current?.focus();
  };

  const handleSelectRow = (phraseKey: string) => {
    setSelectedRows((prev) =>
      prev.includes(phraseKey)
        ? prev.filter((key) => key !== phraseKey)
        : [...prev, phraseKey]
    );
  };

  const handleSelectAllRows = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows(filteredData.map((row) => row.phraseKey));
    } else {
      setSelectedRows([]);
    }
  };

  const handleBulkDelete = () => {
    const updatedData = localData.filter(
      (row) => !selectedRows.includes(row.phraseKey)
    );
    setLocalData(updatedData);
    setSelectedRows([]);
  };

  useEffect(() => {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    if (page >= totalPages && totalPages > 0) {
      setPage(totalPages - 1);
    }
  }, [filteredData.length, page, rowsPerPage]);

  return (
    <Paper sx={{ margin: 3, width: "90vw", padding: 2 }}>
      <TopPanel
        menuAnchor={menuAnchor}
        handleMenuOpen={handleMenuOpen}
        handleMenuClose={handleMenuClose}
        handleMissingTranslationsToggle={handleMissingTranslationsToggle}
        filterMissingTranslations={filterMissingTranslations}
        selectedNamespaces={selectedNamespaces}
        handleNamespaceChange={(event) => {
          const {
            target: { value },
          } = event;
          setSelectedNamespaces(
            typeof value === "string" ? value.split(",") : value
          );
        }}
        handleAddPhrase={handleAddPhrase}
        handleBulkDelete={handleBulkDelete}
        selectedRowsLength={selectedRows.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <TableContainer sx={{ width: "100%" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedRows.length > 0 &&
                    selectedRows.length < filteredData.length
                  }
                  checked={
                    filteredData.length > 0 &&
                    selectedRows.length === filteredData.length
                  }
                  onChange={handleSelectAllRows}
                />
              </TableCell>
              <TableCell />
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sx={{ fontWeight: 700 }}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: "pointer" }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: " 🔼",
                      desc: " 🔽",
                    }[header.column.getIsSorted() as string] ?? null}
                  </TableCell>
                ))
              )}
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <React.Fragment key={row.id}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRows.includes(row.original.phraseKey)}
                      onChange={() => handleSelectRow(row.original.phraseKey)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => toggleRow(row.original.id)}
                    >
                      {expandedRows[row.original.id] ? (
                        <KeyboardArrowUp />
                      ) : (
                        <KeyboardArrowDown />
                      )}
                    </IconButton>
                  </TableCell>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {editingRows[row.original.id] ? (
                        cell.column.id === "namespace" ? (
                          <Select
                            value={(cell.getValue() as string) || ""}
                            onChange={(e) =>
                              handleRowChange(
                                row.original.id,
                                "namespace",
                                e.target.value
                              )
                            }
                            fullWidth
                            size="small"
                          >
                            {namespaces.map((namespace) => (
                              <MenuItem key={namespace} value={namespace}>
                                {namespace}
                              </MenuItem>
                            ))}
                          </Select>
                        ) : (
                          <TextField
                            value={cell.getValue() as string}
                            onChange={(e) =>
                              handleRowChange(
                                row.original.id,
                                cell.column.id as keyof LocalizationRow,
                                e.target.value
                              )
                            }
                            fullWidth
                            size="small"
                            inputRef={
                              cell.column.id === "phraseKey"
                                ? phraseKeyRef
                                : null
                            }
                          />
                        )
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Box sx={{ display: "flex" }}>
                      <IconButton
                        size="small"
                        onClick={() => toggleEditing(row.original.id)}
                      >
                        {editingRows[row.original.id] ? (
                          <Done color="success" />
                        ) : (
                          <Edit color="primary" />
                        )}
                      </IconButton>
                      {editingRows[row.original.id] && (
                        <IconButton
                          size="small"
                          onClick={() => handleCancelEdit(row.original.id)}
                        >
                          <Cancel color="secondary" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteRow(row.original.phraseKey)}
                      >
                        <Delete color="error" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={7} padding="none">
                    <Collapse
                      in={expandedRows[row.original.id]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <ExpandedView
                        isEditing={editingRows[row.original.id]}
                        row={row.original}
                        onUpdateTranslation={(lang, translation) =>
                          handleTranslationChange(
                            row.original.phraseKey,
                            lang,
                            translation
                          )
                        }
                      />
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        showFirstButton
        showLastButton
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={(_e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
};

export default LocalizationManager;
