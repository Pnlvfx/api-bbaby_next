import nodemon from 'nodemon';
import ngrok from 'ngrok';

const start = async () => {
  const url = await ngrok.connect({
    proto: 'http',
    addr: 4000,
  });
  nodemon({
    script: './dist/server.js',
    ext: 'js',
    exec: `NGROK_URL=${url} node`,
  })
    .on('start', () => {
      console.log('The application has started');
    })
    // .on('restart', (files) => {
    //   console.group('Application restarted due to:');
    //   files?.forEach((file) => console.log(file));
    //   console.groupEnd();
    // })
    .on('quit', async () => {
      console.log('The application has quit, closing ngrok tunnel');
      await ngrok.kill();
      process.exit(0);
    });
};

start();
