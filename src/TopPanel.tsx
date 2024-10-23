import React, { useState } from "react";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Select,
  OutlinedInput,
  Chip,
  TextField,
  IconButton,
} from "@mui/material";
import {
  FilterList,
  Add,
  MoreVert,
  Delete,
  ImportExport,
} from "@mui/icons-material";
import { namespaces } from "./data";

type Props = {
  menuAnchor: null | HTMLElement;
  handleMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  handleMenuClose: () => void;
  handleMissingTranslationsToggle: () => void;
  filterMissingTranslations: boolean;
  selectedNamespaces: string[];
  handleNamespaceChange: () => void;
  handleAddPhrase: () => void;
  handleBulkDelete: () => void;
  selectedRowsLength: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
};

const TopPanel: React.FC<Props> = ({
  menuAnchor,
  handleMenuOpen,
  handleMenuClose,
  handleMissingTranslationsToggle,
  filterMissingTranslations,
  selectedNamespaces,
  handleNamespaceChange,
  handleAddPhrase,
  handleBulkDelete,
  selectedRowsLength,
  searchTerm,
  setSearchTerm,
}) => {
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  const filtersCount = [
    filterMissingTranslations,
    selectedNamespaces.length !== 0,
  ].reduce((acc, value) => (value ? acc + 1 : acc), 0);

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setActionMenuAnchor(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
  };

  return (
    <Box mb={2} sx={{ display: "flex", gap: 1 }}>
      <Button
        aria-controls="filters-menu"
        aria-haspopup="true"
        variant="contained"
        onClick={handleMenuOpen}
        startIcon={<FilterList />}
        sx={{ fontWeight: filtersCount ? 700 : 400 }}
        color={filtersCount ? "success" : "primary"}
      >
        Filters {filtersCount ? `(${filtersCount} active)` : null}
      </Button>

      <Menu
        id="filters-menu"
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem>
          <ListItemText>Namespace</ListItemText>
          <Select
            size="small"
            multiple
            value={selectedNamespaces}
            onChange={handleNamespaceChange}
            input={<OutlinedInput label="Namespace" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
            sx={{ ml: 2, width: 200 }}
          >
            {namespaces.map((name) => (
              <MenuItem key={name} value={name}>
                <Checkbox checked={selectedNamespaces.indexOf(name) > -1} />
                {name}
              </MenuItem>
            ))}
          </Select>
        </MenuItem>

        <MenuItem onClick={handleMissingTranslationsToggle}>
          <ListItemIcon>
            <Checkbox checked={filterMissingTranslations} />
          </ListItemIcon>
          <ListItemText>With missing translations</ListItemText>
        </MenuItem>
      </Menu>

      <IconButton
        aria-controls="action-menu"
        aria-haspopup="true"
        onClick={handleActionMenuOpen}
        disabled={selectedRowsLength === 0}
        sx={{ ml: "auto" }}
      >
        <MoreVert />
      </IconButton>

      <Menu
        id="action-menu"
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={handleBulkDelete}>
          <ListItemIcon>
            <Delete />
          </ListItemIcon>
          <ListItemText>Delete Selected</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ImportExport />
          </ListItemIcon>
          <ListItemText>Export Selected</ListItemText>
        </MenuItem>
      </Menu>

      <Button variant="contained" endIcon={<ImportExport />}>
        Export all
      </Button>
      <Button variant="contained" endIcon={<ImportExport />}>
        Import
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddPhrase}
        endIcon={<Add />}
      >
        Add
      </Button>

      <TextField
        size="small"
        label="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </Box>
  );
};

export default TopPanel;
