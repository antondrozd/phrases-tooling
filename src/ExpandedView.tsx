import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Translate } from "@mui/icons-material";
import { languages } from "./data";
import { LocalizationRow } from "./types";

const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;

type Props = {
  row: Pick<
    LocalizationRow,
    "phraseKey" | "defaultTranslation" | "translations"
  >;
  isEditing: boolean;
  onUpdateTranslation: (language: string, translation: string) => void;
};

const translateText = async (text: string, targetLanguage: string) => {
  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`,
    {
      method: "POST",
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
        source: "en",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const result = await response.json();

  return result?.data?.translations[0]?.translatedText || "";
};

const ExpandedView: React.FC<Props> = ({
  row,
  isEditing,
  onUpdateTranslation,
}) => {
  const [loadingTranslation, setLoadingTranslation] = useState<boolean>(false);

  const handleTranslate = async (languageCode: string) => {
    setLoadingTranslation(true);
    const translatedText = await translateText(
      row.defaultTranslation,
      languageCode
    );
    onUpdateTranslation(languageCode, translatedText);
    setLoadingTranslation(false);
  };

  return (
    <Box margin={2}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Language</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Translation</TableCell>
            <TableCell sx={{ fontWeight: 700 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {languages.map((lang) => (
            <TableRow key={lang.code}>
              <TableCell>{lang.name}</TableCell>
              <TableCell>
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    value={row.translations[lang.code] || ""}
                    onChange={(e) =>
                      onUpdateTranslation(lang.code, e.target.value)
                    }
                  />
                ) : (
                  <Box>{row.translations[lang.code] || "❌😢"}</Box>
                )}
              </TableCell>
              <TableCell>
                {isEditing && (
                  <IconButton
                    size="small"
                    onClick={() => handleTranslate(lang.code)}
                    disabled={loadingTranslation}
                  >
                    {loadingTranslation ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Translate color="primary" />
                    )}
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ExpandedView;
