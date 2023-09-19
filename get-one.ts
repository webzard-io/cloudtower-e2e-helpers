export async function getOne<TData, TWhere>(
  fn: (params: { where: TWhere }) => Promise<{ data: TData[] }>,
  where: TWhere
): Promise<TData> {
  const { data } = await fn({ where });

  if (data.length === 0) {
    throw new Error(
      `unable to find entity with filter: "${JSON.stringify(where)}"`
    );
  }

  if (data.length > 1) {
    throw new Error(
      `find more than one(${data.length}) entity with filter: "${JSON.stringify(
        where
      )}"`
    );
  }

  return data[0];
}
