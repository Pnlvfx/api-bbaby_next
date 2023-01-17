import { ChildProcessWithoutNullStreams, spawn } from "child_process";

export const convertEnd = (convert: ChildProcessWithoutNullStreams, callback: (code: number) => void) => {
  return new Promise((resolve, rejects) => {
    convert.on("close", (code) => {
      if (code === 0) return resolve(callback(code));
    });
    convert.stderr.on("data", (data) => {
      return rejects(`stderr: ${data}`);
    });
    convert.stdout.on("data", (data) => {
      return rejects(`stdout: ${data}`);
    });
  });
};
