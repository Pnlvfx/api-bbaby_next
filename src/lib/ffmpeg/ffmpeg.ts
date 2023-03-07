import { spawn } from 'child_process';
import coraline from '../../coraline/coraline';
import path from 'path';
import { catchError } from '../../coraline/cor-route/crlerror';
import fs from 'fs';

const ffmpeg = {
  videoToAudio: (video: string, output?: string) => {
    return new Promise<string>((resolve, rejects) => {
      if (!output) {
        const folder = coraline.use('lib/audio');
        output = `${folder}/${coraline.generateRandomId(10)}.mp3`;
      }
      const ffmpeg = spawn('ffmpeg', ['-y', '-i', video, output]);
      ffmpeg.stdout.on('data', () => {
        //
      });

      ffmpeg.on('error', (err) => {
        return rejects(`ffmpeg: ${err}`);
      });

      ffmpeg.stderr.on('data', () => {
        console.log('ffmpeg converting');
      });

      ffmpeg.on('close', () => {
        return resolve(output as string);
      });
    });
  },
  splitAudioByDuration: async (audio: string, duration: string | number) => {
    try {
      const full_duration = await ffmpeg.getDuration(audio);
      const segments = Math.floor(full_duration / Number(duration));
      const outputDir = path.dirname(audio);
      const outputs = [];
      let startTime = 0;
      for (let i = 1; i <= segments; i++) {
        const outputFile = `${outputDir}/output${i}.flac`;
        const ffmpeg = spawn('ffmpeg', ['-y', '-i', audio, '-ss', startTime.toString(), '-t', duration.toString(), outputFile]);
        startTime += Number(duration);

        ffmpeg.stderr.on('data', () => {
          //
        });
        outputs.push(
          new Promise<string>((resolve, reject) => {
            ffmpeg.on('close', async (code) => {
              if (code === 0) {
                resolve(outputFile);
              } else {
                reject(code?.toString());
              }
            });
          }),
        );
      }
      const outputFiles = await Promise.all(outputs);
      return outputFiles;
    } catch (err) {
      throw catchError(err);
    }
  },
  getDuration: (audio: string) => {
    return new Promise<number>((resolve, reject) => {
      const ffprobe = spawn('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', audio]);
      let duration = '';
      ffprobe.stdout.on('data', (data) => {
        duration += data;
      });
      ffprobe.on('close', (code) => {
        if (code === 0) {
          resolve(parseFloat(duration));
        } else {
          reject(code);
        }
      });
    });
  },
  imagesToTransparentVideo: (images: FFmpegImage[], output: string) => {
    return new Promise<string>((resolve, reject) => {
      const inputFile = `input.txt`;
      const inputList = images
        .map((image) => {
          return `file ${image.path}\nduration ${image.loop}`;
        })
        .join('\n');
      fs.writeFileSync(inputFile, inputList);
      const ffmpeg = spawn('ffmpeg', ['-safe', '0', '-f', 'concat', '-i', inputFile, '-c:v', 'vp9', '-pix_fmt', 'yuva420p', '-b:v', '1M', output]);
      ffmpeg.stdin.end();

      ffmpeg.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      ffmpeg.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) resolve(output);
        reject('Error when trying to convert this image!');
      });
    });
  },
  overlayImagesToVideo: (images: FFmpegImage[], video: string, audio: string, output: string, duration: number) => {
    return new Promise((resolve, reject) => {
      const args = ['-y', '-i', video];
      for (let i = 0; i < images.length; i++) {
        args.push('-i', images[i].path);
      }
      args.push('-i', audio);
      args.push('-filter_complex');
      const filtergraph = [];
      let start_time = 0;
      for (let i = 0; i < images.length; i++) {
        if (i === 0) {
          filtergraph.push(
            `[0][1]overlay=x=(main_w-overlay_w)/2:y=(main_h-overlay_h)/2:enable='between(t,${start_time},${start_time + images[i].loop})'[v1]`,
          );
        } else {
          filtergraph.push(
            `[v${i}][${i + 1}]overlay=x=(main_w-overlay_w)/2:y=(main_h-overlay_h)/2:enable='between(t,${start_time},${
              start_time + images[i].loop
            })'[v${i + 1}]`,
          );
        }
        start_time += images[i].loop;
      }
      const filter = filtergraph.join(';');
      args.push(filter);
      args.push('-map', `[v${images.length}]`, '-map', `${images.length + 1}:a`);
      args.push('-t', duration.toString(), output); //-t duration
      const ffmpegCommand = spawn('ffmpeg', args);
      ffmpegCommand.on('error', (err) => {
        reject(err);
      });
      ffmpegCommand.stderr.on('data', (data) => {
        console.log(data.toString());
      });
      ffmpegCommand.on('close', (code) => {
        if (code === 0) resolve(output);
      });
    });
  },
  concatenateVideos: (videos: string[], width: number, height: number, output: string) => {
    return new Promise<string>((resolve, reject) => {
      const inputs = videos.map((path) => ['-i', path]).reduce((a, b) => a.concat(b), []);
      let concatFilter = '';
      for (let i = 0; i < videos.length; i++) {
        concatFilter += `[${i}:v]`;
      }
      concatFilter += `concat=n=${videos.length}:v=1:a=0[outv]`;

      const ffmpeg = spawn('ffmpeg', [
        '-y',
        ...inputs,
        '-filter_complex',
        concatFilter,
        '-map',
        '[outv]',
        '-s',
        `${width}x${height}`,
        '-c:v',
        'libx264',
        '-c:a',
        'aac',
        '-b:v',
        '2M',
        '-r',
        '30',
        output,
      ]);

      ffmpeg.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      ffmpeg.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) resolve(output);
        reject('Error when trying to concatenate this videos!');
      });
    });
  },
  resizeVideo: (video: string, width: number, height: number, output: string) => {
    return new Promise<string>((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-y',
        '-i',
        video,
        '-vf',
        `scale=${width}:${height}`,
        '-c:v',
        'libx264',
        '-c:a',
        'aac',
        '-b:v',
        '2M',
        '-r',
        '30',
        output,
      ]);

      ffmpeg.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      ffmpeg.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) resolve(output);
        reject('Error when trying to resize this videos!');
      });
    });
  },
};

export default ffmpeg;

//ffmpeg -i /Users/simo97/Desktop/coraline/bbaby_next/gov/lib/quora/0e8c055999/background_video.mp4  -i /Users/simo97/Desktop/coraline/bbaby_next/gov/lib/quora/0e8c055999/overlay0.png  -i /Users/simo97/Desktop/coraline/bbaby_next/gov/lib/quora/0e8c055999/overlay1.png  -i /Users/simo97/Desktop/coraline/bbaby_next/gov/lib/quora/0e8c055999/overlay2.png  -filter_complex "[0][1]overlay=x=(main_w-overlay_w)/2:y=(main_h-overlay_h)/2:enable='between(t,0,7)'[v1]; [v1][2]overlay=x=(main_w-overlay_w)/2:y=(main_h-overlay_h)/2:enable='between(t,10,20)'[v2]; [v2][3]overlay=x=(main_w-overlay_w)/2:y=(main_h-overlay_h)/2:enable='gt(t,23)'[v3]" -map "[v3]"  /Users/simo97/Desktop/coraline/bbaby_next/gov/lib/quora/0e8c055999/out.mp4
