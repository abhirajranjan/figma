const config = {
  Rect: {
    getNewFill: () => "rgba(0,0,255,0.3)",
    getFill: () => {
      return `rgb(${Math.random() * 255},${Math.random() * 255},${
        Math.random() * 255
      })`;
    },
  },
};

export default config;
