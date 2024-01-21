import pexelsapis from 'pexelsapis';
import config from './config';

export const apiconfig = {
  telegram: {
    my_chat_id: 420_309_635,
    logs_group_id: -1_001_649_395_850,
  },
};

export const pexels = pexelsapis(config.PEXELS_API_KEY);
