const regex = {
  upperLowerCase: (name: string) => {
    return new RegExp(`^${name}$`, 'i');
  },
  emoji: /<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu,
};

export default regex;
