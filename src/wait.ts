export type Wait = Partial<{
  timeout: number;
  interval: number;
}>;

export function waitUntil<TData>(
  fn: () => Promise<TData>,
  wait?: Wait
): Promise<TData> {
  const { timeout = 30, interval = 3 } = wait || {};
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timeoutMs = timeout * 1000;

    const callFn = async () => {
      let err;
      try {
        const data = await fn();
        if (data) {
          clearInterval(timer);
          resolve(data);
          return;
        }
      } catch (error) {
        err = error;
      }

      if (Date.now() - start > timeoutMs) {
        clearInterval(timer);
        reject(`timeout after ${timeout}s, error: ${err}`);
      }
    };

    callFn();
    const timer = setInterval(() => {
      callFn();
    }, interval * 1000);
  });
}
