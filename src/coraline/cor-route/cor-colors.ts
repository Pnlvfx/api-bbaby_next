const coralineColors = {
  getDarkColor: () => {
    let color = "#";
    for (let i = 0; i < 3; i++) color += ("0" + Math.floor((Math.random() * Math.pow(16, 2)) / 2).toString()).slice(-2);
    return color;
  },
  getDarkColorRgb: () => {
    const red = Math.floor((Math.random() * 256) / 2);
    const green = Math.floor((Math.random() * 256) / 2);
    const blue = Math.floor((Math.random() * 256) / 2);
    return "rgb(" + red + ", " + green + ", " + blue + ")";
  },
  getLightColor: () => {
    let color = "#";
    for (let i = 0; i < 3; i++) color += ("0" + Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)).slice(-2);
    return color;
  },
  getLightColorRgb: () => {
    const red = Math.floor(((1 + Math.random()) * 256) / 2);
    const green = Math.floor(((1 + Math.random()) * 256) / 2);
    const blue = Math.floor(((1 + Math.random()) * 256) / 2);
    return "rgb(" + red + ", " + green + ", " + blue + ")";
  },
};

export default coralineColors;
