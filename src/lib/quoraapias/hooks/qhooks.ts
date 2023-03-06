import { spawn } from 'child_process';

export const startChrome = () => {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--remote-debugging-port=9222']);
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
