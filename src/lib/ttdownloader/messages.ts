const wrongMessage = 'Sorry, I can only download TikTok videos from URLs. Please send me a message with a TikTok video URL to download the video.';
const successMessageArr = [
  "Awesome! Here's your TikTok video.",
  'Your video is ready! Check it out.',
  "Here's the TikTok video you requested.",
  'Woohoo! Video downloaded and ready to watch.',
  "You're going to love this TikTok video.",
  "It's downloading... and done! Check out the video.",
  "You've got mail! Your TikTok video is here.",
  "Here's your TikTok video! Enjoy.",
  'Voilà! The TikTok video is ready to watch.',
  'Success! Downloaded and sent your TikTok video.',
  "You're in for a treat! Here's your TikTok video.",
  'Mission accomplished! TikTok video sent.',
];

const helpMessage =
  '1. Type or paste a TikTok video URL in the chat window. 2. Wait a few seconds for the bot to download the video. \n3. The bot will send back the downloaded video without any watermark. Enjoy watching the TikTok video!';

const startMessage =
  'Welcome to TikTokDownloader Bot! To download a TikTok video, simply send me a message with the video. (You can also share it from TikTok by selecting "telegram" and then me)';

export { wrongMessage, successMessageArr, helpMessage, startMessage };
