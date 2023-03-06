import { spawn } from 'child_process';
import coraline from '../../../coraline/coraline';

export const startChrome = async () => {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--remote-debugging-port=9222']);
  await coraline.wait(5000);
  chrome.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  chrome.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  chrome.on('error', (err) => {
    throw new Error(err.message);
  });
};
