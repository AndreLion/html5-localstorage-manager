module.exports = {
  theme: {
    extend: {
      colors: {
        white: "#FFFFFF",
        grey: {
          "100": "#f8f9fb",
          "200": "#f2f2f2",
          "300": "#ededed",
          "400": "#e3e3e3",
          "500": "#d4d4d6",
          default: "#d4d4d6",
          "600": "#afafb3",
          "700": "#7a7980",
          "800": "#484751",
          "900": "#1f1f26"
        },
        black: "#000000",
        red: {
          "100": "#ffedee",
          "200": "#ffabb0",
          "300": "#ff616b",
          "400": "#fa4b56",
          "500": "#f5333f",
          default: "#f5333f",
          "600": "#d42733",
          "700": "#bf1d28",
          "800": "#8f171f",
          "900": "#5a0e13"
        },
        orange: {
          "100": "#fee7e2",
          "200": "#fed5cd",
          "300": "#ffb9aa",
          "400": "#ff9986",
          "500": "#ff755a",
          default: "#ff755a",
          "600": "#d85c44",
          "700": "#c9523b",
          "800": "#9c3622",
          "900": "#631101"
        },
        yellow: {
          "100": "#fffbed",
          "200": "#ffea9b",
          "300": "#ffdd61",
          "400": "#ffd84a",
          "500": "#ffc600",
          default: "#ffc600",
          "600": "#eeb902",
          "700": "#eab602",
          "800": "#b38c00",
          "900": "#7c6100"
        },
        green: {
          "100": "#f2faf7",
          "200": "#c4e7da",
          "300": "#85ccb2",
          "400": "#3dae84",
          "500": "#00945e",
          default: "#00945e",
          "600": "#11885d",
          "700": "#007349",
          "800": "#02613e",
          "900": "#014b30"
        },
        blue: {
          "100": "#f0f7ff",
          "200": "#d3e5fb",
          "300": "#6da9f2",
          "400": "#428be2",
          "500": "#2a7de1",
          default: "#2a7de1",
          "600": "#1e6ccb",
          "700": "#0c54ad",
          "800": "#043a7c",
          "900": "#0d2f59"
        },
        purple: {
          "100": "#f7edff",
          "200": "#e4cdf6",
          "300": "#b37ade",
          "400": "#9861c0",
          "500": "#8246af",
          default: "#8246af",
          "600": "#6b3098",
          "700": "#531980",
          "800": "#3c0f5f",
          "900": "#22033a"
        },
        pink: {
          "100": "#fff2f8",
          "200": "#ffdfee",
          "300": "#ffbfdc",
          "400": "#fda4cc",
          "500": "#f97fb5",
          default: "#f97fb5",
          "600": "#e969a2",
          "700": "#bf3070",
          "800": "#a5215c",
          "900": "#820d41"
        },
        sponsor: '#ec6cb9'
      }
    }
  },
  variants: {
    visibility: ['responsive', 'hover', 'focus', 'group-hover'],
    textColor: ['responsive', 'hover', 'focus']
  },
  plugins: [],
  purge: {
    enabled: true,
    content: ["./src/**/*.html", "./src/**/*.vue"]
  }
};
