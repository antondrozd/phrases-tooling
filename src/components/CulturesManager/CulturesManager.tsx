import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  IconButton,
} from "@mui/material";
import { Edit, Done, Add, Cancel, Delete } from "@mui/icons-material";
import { useDrag, useDrop, DndProvider, useDragLayer } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type Language = {
  id: string;
  code: string;
  name: string;
};

const initialLanguages: Language[] = [
  { id: "1", code: "en-US", name: "English (United States)" },
  { id: "2", code: "fr-FR", name: "French (France)" },
  { id: "3", code: "de-DE", name: "German (Germany)" },
];

const ItemType = "LanguageBlock";

type Props = {
  language: Language;
  index: number;
  moveLanguageBlock: (dragIndex: number, hoverIndex: number) => void;
  isEditing: boolean;
  onEditClick: () => void;
  onSaveClick: (code: string, name: string) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
};

const LanguageBlock = ({
  language,
  index,
  moveLanguageBlock,
  isEditing,
  onEditClick,
  onSaveClick,
  onCancelEdit,
  onDelete,
}: Props) => {
  const [code, setCode] = useState(language.code);
  const [name, setName] = useState(language.name);

  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging: dragStatus }, drag] = useDrag({
    type: ItemType,
    item: { index, language },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover(item: { index: number }) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveLanguageBlock(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <Box
      ref={ref}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mb: 2,
        opacity: dragStatus ? 0 : 1,
        cursor: "move",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          p: 2,
          gap: 2,
        }}
      >
        {isEditing ? (
          <>
            <TextField
              label="Culture Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              size="small"
            />
            <TextField
              label="Language Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="small"
              fullWidth
            />
            <IconButton
              color="primary"
              onClick={() => onSaveClick(code, name)}
              sx={{ ml: "auto" }}
            >
              <Done />
            </IconButton>
            <IconButton color="secondary" onClick={onCancelEdit}>
              <Cancel />
            </IconButton>
          </>
        ) : (
          <>
            <Typography>{language.code}</Typography>
            <Typography>{language.name}</Typography>
            <IconButton
              color="primary"
              onClick={onEditClick}
              sx={{ ml: "auto" }}
            >
              <Edit />
            </IconButton>
            <IconButton color="error" onClick={onDelete}>
              <Delete />
            </IconButton>
          </>
        )}
      </Paper>
    </Box>
  );
};

const CustomDragLayer = () => {
  const { isDragging, currentOffset, item } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getSourceClientOffset(),
    item: monitor.getItem(),
  }));

  if (!isDragging || !currentOffset || !item) {
    return null;
  }

  const { language } = item;

  const layerStyles: React.CSSProperties = {
    position: "fixed",
    pointerEvents: "none",
    top: 0,
    left: 0,
    width: "50%",
    transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`,
    zIndex: 1000,
  };

  return (
    <div style={layerStyles}>
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          gap: 2,
          backgroundColor: "white",
          width: "100%",
        }}
      >
        <Typography>{language.code}</Typography>
        <Typography>{language.name}</Typography>
        <IconButton color="primary">
          <Edit />
        </IconButton>
      </Paper>
    </div>
  );
};

const CulturesManager: React.FC = () => {
  const [languages, setLanguages] = useState(initialLanguages);
  const [editingLanguageId, setEditingLanguageId] = useState<string | null>(
    null
  );

  const moveLanguageBlock = (dragIndex: number, hoverIndex: number) => {
    const updatedLanguages = Array.from(languages);
    const [movedBlock] = updatedLanguages.splice(dragIndex, 1);
    updatedLanguages.splice(hoverIndex, 0, movedBlock);
    setLanguages(updatedLanguages);
  };

  const handleAddBlock = () => {
    const newId = (languages.length + 1).toString();
    setLanguages([...languages, { id: newId, code: "", name: "" }]);
    setEditingLanguageId(newId);
  };

  const handleSaveBlock = (id: string, code: string, name: string) => {
    setLanguages((prev) =>
      prev.map((lang) => (lang.id === id ? { ...lang, code, name } : lang))
    );
    setEditingLanguageId(null);
  };

  const handleCancelEdit = () => {
    setEditingLanguageId(null);
  };

  const handleDeleteBlock = (id: string) => {
    setLanguages((prev) => prev.filter((lang) => lang.id !== id));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          width: "50%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CustomDragLayer />
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {languages.map((language, index) => (
            <LanguageBlock
              key={language.id}
              language={language}
              index={index}
              moveLanguageBlock={moveLanguageBlock}
              isEditing={editingLanguageId === language.id}
              onEditClick={() => setEditingLanguageId(language.id)}
              onSaveClick={(code, name) =>
                handleSaveBlock(language.id, code, name)
              }
              onCancelEdit={handleCancelEdit}
              onDelete={() => handleDeleteBlock(language.id)}
            />
          ))}
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddBlock}
            sx={{ mb: 2 }}
          >
            Add Language
          </Button>
        </Box>
        <Button variant="contained" sx={{ mt: 2, ml: "auto" }}>
          Save
        </Button>
      </Paper>
    </DndProvider>
  );
};

export default CulturesManager;
