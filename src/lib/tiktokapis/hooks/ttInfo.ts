import { load } from 'cheerio';
import { catchError } from '../../../coraline/cor-route/crlerror';

export const getInfo = async (link: string) => {
  const host = 'https://ttsave.app/download';
  const body = { id: link };
  const res = await fetch(host, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  const html = await res.text();
  try {
    const $ = load(html);
    const response: TiktokInfoProps = {
      success: true,
      author: {
        name: $('div div h2').text(),
        profile: $('div a').attr('href'),
        username: $('div a.font-extrabold.text-blue-400.text-xl.mb-2').text(),
      },
      video: {
        thumbnail: $('div.hidden.flex-col.text-center a:nth-child(5)').attr('href'),
        views: $('div.flex.flex-row.items-center.justify-center.gap-2.mt-2 div:nth-child(1) span').text(),
        loves: $('div.flex.flex-row.items-center.justify-center.gap-2.mt-2 div:nth-child(2) span').text(),
        comments: $('div.flex.flex-row.items-center.justify-center.gap-2.mt-2 div:nth-child(3) span').text(),
        shares: $('div.flex.flex-row.items-center.justify-center.gap-2.mt-2 div:nth-child(4) span').text(),
        url: {
          no_wm: $("a:contains('DOWNLOAD (WITHOUT WATERMARK)')").attr('href'),
          wm: $("a:contains('DOWNLOAD (WITH WATERMARK)')").attr('href'),
        },
      },
      backsound: {
        name: $('div.flex.flex-row.items-center.justify-center.gap-1.mt-5 span').text(),
        url: $("a:contains('DOWNLOAD AUDIO (MP3)')").attr('href'),
      },
    };
    return response;
  } catch (err) {
    throw catchError(err);
  }
};
