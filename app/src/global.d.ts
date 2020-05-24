declare module '@material-ui/core/styles/createBreakpoints' {
  interface BreakpointOverrides {
    xxs: true;
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
  }
}

declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    highlight: PaletteColor;
    border: PaletteColor & { veryLight: string };
    selected: PaletteColor;
    textLight: PaletteColor;
    textWarning: PaletteColor;
  }

  // allow configuration using `createMuiTheme`
  interface PaletteOptions {
    highlight: PaletteColorOptions;
    border: PaletteColorOptions & { veryLight: string };
    selected: PaletteColorOptions;
    textLight: PaletteColorOptions;
    textWarning: PaletteColorOptions;
  }
}

export {};