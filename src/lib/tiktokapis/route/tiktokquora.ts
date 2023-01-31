const tiktokquora = {
  splitText: (text: string, max: number) => {
    const textArray = text.split(' ');
    const parts = [];
    let part = '';
    for (let i = 0; i < textArray.length; i++) {
      if (part.length + textArray[i].length + 1 <= max) {
        part += textArray[i] + ' ';
      } else {
        parts.push(part);
        part = textArray[i] + ' ';
      }
    }
    parts.push(part);
    return parts;
  },
};

export default tiktokquora;
