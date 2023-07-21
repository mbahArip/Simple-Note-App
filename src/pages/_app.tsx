import { Box, ThemeOptions, ThemeProvider, createTheme } from "@mui/material";
import type { AppProps } from "next/app";
import { Montserrat } from "next/font/google";
import "styles/globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  preload: true,
});

export default function App({ Component, pageProps }: AppProps) {
  const theme: ThemeOptions = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#673ab7",
      },
      error: {
        main: "#dc3545",
      },
      background: {
        default: "#212121",
        paper: "#303030",
      },
      text: {
        primary: "#f5f5f5",
        secondary: "#9e9e9e",
        disabled: "#757575",
      },
    },
    typography: {
      fontFamily: "Inter, sans-serif",
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <Box
        width={"100vw"}
        minHeight={"100vh"}
        bgcolor={"background.default"}
        color={"text.primary"}
      >
        <Component {...pageProps} />
      </Box>
    </ThemeProvider>
  );
}
