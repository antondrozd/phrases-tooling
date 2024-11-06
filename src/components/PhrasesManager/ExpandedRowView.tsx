import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { languages } from "@/data";
import { type LocalizationRow } from "@/types";

type Props = {
  row: Pick<
    LocalizationRow,
    "phraseKey" | "defaultTranslation" | "translations"
  >;
  isEditing: boolean;
  onUpdateTranslation: (language: string, translation: string) => void;
};

const ExpandedRowView = ({ row, isEditing, onUpdateTranslation }: Props) => {
  return (
    <Box margin={2}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Language</TableCell>
            <TableCell>Translation</TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ExpandedRowView;
