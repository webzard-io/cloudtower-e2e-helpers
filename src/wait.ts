export type Wait = Partial<{
  timeout: number;
  interval: number;
}>;

export function waitUntil<TData>(
  fn: () => Promise<TData>,
  wait?: Wait,
  options?: {
    /**
     * By default, if `fn` throws an error, `waitUntil`
     * will not reject until `wait.timeout` is exceeded.
     * If you want `waitUntil` rejects once `fn` throws
     * an error, set failFast to true.
     */
    failFast?: boolean;
  }
): Promise<TData> {
  const { timeout = 30, interval = 3 } = wait || {};
  const { failFast = false } = options || {}
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

      const _reject = (reason: any) => {
        clearInterval(timer);
        reject(reason);
      };
      if (Date.now() - start > timeoutMs) {
        _reject(`timeout after ${timeout}s, error: ${err}`);
      } else if (failFast && err) {
        _reject(err);
      };
    };

    callFn();
    const timer = setInterval(() => {
      callFn();
    }, interval * 1000);
  });
}
