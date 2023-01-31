/* eslint-disable @typescript-eslint/no-unused-vars */
interface AImageResponse {
  created: number;
  data: AiImage[];
  error: {
    code: null | number;
    message: string;
    param: null;
    type: string;
  };
}

type AiImage = {
  url: string;
};
