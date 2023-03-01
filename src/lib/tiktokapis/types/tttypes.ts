/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
interface TiktokInfoProps {
  success: boolean;
  author: {
    name: string;
    profile?: string;
    username: string;
  };
  video: {
    thumbnail?: string;
    views: string;
    loves: string;
    comments: string;
    shares: string;
    url: {
      no_wm?: string;
      wm?: string;
    };
  };
  backsound: {
    name: string;
    url?: string;
  };
}

interface DownloadReponse {
  id: string;
  video: CoralineMedia;
}

interface TiktokProps extends DownloadReponse {
  text: string;
}
