import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { languages } from "./data";
import { LocalizationRow } from "./types";

type Props = {
  row: Pick<
    LocalizationRow,
    "phraseKey" | "defaultTranslation" | "translations"
  >;
  isEditing: boolean;
  onUpdateTranslation: (language: string, translation: string) => void;
};

const ExpandedView: React.FC<Props> = ({
  row,
  isEditing,
  onUpdateTranslation,
}) => {
  return (
    <Box margin={2}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Language</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Translation</TableCell>
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

export default ExpandedView;
