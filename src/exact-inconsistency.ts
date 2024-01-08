export type ExactEvent = {
  progress: number;
  done: boolean;
  size: number;
  consistent?: boolean;
  detail: string;
  error?: string;
};
export type ExactJobType = "one-one" | "group";
export type ExactJob = {
  key: ["jobs", string];
  value: {
    events: ExactEvent[] | ExactEvent[][];
    createdAt: string;
    status: string;
    error?: string;
    params?: {
      job_type?: ExactJobType;
    };
  };
};

function getInconsistency(
  event: ExactEvent
): { offset: number; width: number; size: number }[] {
  const inConsistencies: { offset: number; width: number; size: number }[] = [];
  try {
    const { size, detail } = event || {};
    const { buffer_size, in_consistent_offsets } = JSON.parse(detail);
    const width = (100 * buffer_size) / size;

    for (const o of in_consistent_offsets) {
      const offset = (100 * o) / size;
      inConsistencies.push({
        offset,
        width,
        size,
      });
    }
    return inConsistencies;
  } catch {
    return inConsistencies;
  }
}

/**
 * Calculate the inconsistency percentage (0-100) with the result of exact's
 * [get-job api](http://gitlab.smartx.com/frontend/exact/-/blob/master/routes/api/get-job.ts).
 *
 * @returns Note that the range is 0-100, not 0-1
 */
export function getInconsistencyPercent(events: ExactJob['value']['events']): number {
  let total = 0;
  let sum = 0;
  for (const event of events) {
    if (Array.isArray(event)) {
      continue;
    }
    const inconsistency = getInconsistency(event);
    total += event.size;
    for (const ic of inconsistency) {
      sum += ic.size * ic.width;
    }
  }

  return sum / total || 0;
}
