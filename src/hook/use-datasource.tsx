import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface IUserResourceProps<T, K extends string> {
  queryFn: () => Promise<T>;
  queryKey: K;
}

// Utility to generate setter name like "setTodos"
function toSetterName<K extends string>(key: K): `set${Capitalize<K>}` {
  return ("set" +
    key.charAt(0).toUpperCase() +
    key.slice(1)) as `set${Capitalize<K>}`;
}

export function useDatasource<T, K extends string>(
  props: IUserResourceProps<T, K>,
  dependencies: any[],
  initialData: T
): {
  [P in K]: T;
} & {
  [P in `set${Capitalize<K>}`]: React.Dispatch<React.SetStateAction<T>>;
} & {
  refetch: () => Promise<void>;
} & {
  isLoading: boolean;
} {
  const { queryFn, queryKey } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<T>(initialData);

  const load = async () => {
    if (!isLoading) setIsLoading(true);

    queryFn()
      .then((response) => setData(response))
      .catch((error) => toast.error(error.response?.data?.message))
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, dependencies);

  return {
    [queryKey]: data,
    [toSetterName(queryKey)]: setData,
    refetch: load,
    isLoading: isLoading,
  } as any;
}
