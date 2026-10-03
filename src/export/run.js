// Runs an export: captures every file of a list and hands it to a sink. This
// does not know about browsers or file systems, both are passed in.
//
// ExportRequest  { game, config, data, formats[], docs?, layouts?,
//                  variation?, scale, b18?: { version, author }, out }
// ProgressEvent  { type: "start" | "doc" | "fail" | "done", done, total,
//                  name, error? }
// Sink           { write(relPath, bytes) }, owns all file I/O
//
// jobs      [{ doc, format, path }] from exportJobs
// capture   async (job) => bytes of the file
// sink      where the files go
// onProgress called with a ProgressEvent
// signal    an AbortSignal, no new file is started once it is aborted
//
// A file that fails to capture or write does not stop the others, it is
// returned in failed.
export const runExport = async ({
  jobs,
  capture,
  sink,
  concurrency = 1,
  signal,
  onProgress = () => {},
}) => {
  const total = jobs.length;
  const failed = [];
  let done = 0;
  let next = 0;

  onProgress({ type: "start", done, total, name: "" });

  const worker = async () => {
    while (next < total && !signal?.aborted) {
      const job = jobs[next++];
      try {
        await sink.write(job.path, await capture(job));
        done++;
        onProgress({ type: "doc", done, total, name: job.path });
      } catch (error) {
        failed.push({ job, error });
        onProgress({ type: "fail", done, total, name: job.path, error });
      }
    }
  };

  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));

  onProgress({ type: "done", done, total, name: "" });

  return { done, total, failed, cancelled: !!signal?.aborted };
};
