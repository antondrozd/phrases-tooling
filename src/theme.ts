import "@fontsource-variable/montserrat";

import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#235873",
    },
    error: {
      main: "#E63946",
      light: "#ef39464c",
    },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiPaper: {
      defaultProps: { square: true },
    },
  },
  shape: { borderRadius: 0 },
  typography: { fontFamily: "Montserrat Variable" },
});
