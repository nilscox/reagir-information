import { useCallback, useEffect, useState } from 'react';

const findById = <T extends { id: number }>(dataset: T[]) => (data: T) => {
  return dataset.find((element: T) => element.id === data.id);
};

const useEditableDataset = <T extends { id: number }>(
  dataset: T[] | null,
  {
    find = findById,
    appendOnUpdate = false,
  } = {},
) => {
  const [copy, setCopy] = useState(dataset);
  // TODO
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const findElement = useCallback(find(copy), [find, copy]);

  useEffect(() => {
    if (appendOnUpdate && copy)
      setCopy([...copy, ...dataset]);
    else
      setCopy(dataset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, appendOnUpdate]);

  const prepend = useCallback((newData: T) => {
    setCopy([newData, ...copy]);
  }, [copy]);

  const append = useCallback((newData: T) => {
    setCopy([...copy, newData]);
  }, [copy]);

  const replace = useCallback((newData: T) => {
    const oldData = findElement(newData);
    const idx = copy.indexOf(oldData);

    if (idx === -1)
      return;

    setCopy([
      ...copy.slice(0, idx),
      newData,
      ...copy.slice(idx + 1),
    ]);
  }, [copy, findElement]);

  const remove = useCallback((item: T) => {
    const idx = copy.indexOf(item);

    if (idx === -1)
      return;

    setCopy([
      ...copy.slice(0, idx),
      ...copy.slice(idx + 1),
    ]);
  }, [copy]);

  return [
    // return the dataset when copy will be set in the useEffect
    copy === undefined ? dataset : copy,
    {
      prepend,
      append,
      replace,
      remove,
    },
  ] as const;
};

export default useEditableDataset;
