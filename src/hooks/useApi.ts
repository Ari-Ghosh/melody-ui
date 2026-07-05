"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { toast } from "sonner";

type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useApi<T = unknown>(initialData?: T) {
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData ?? null,
    error: null,
    loading: false,
  });
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (
      method: ApiMethod,
      path: string,
      body?: unknown,
      options?: { showError?: boolean; showSuccess?: boolean; successMsg?: string }
    ) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        let result: T;
        switch (method) {
          case "GET":
            result = await apiGet<T>(path);
            break;
          case "POST":
            result = await apiPost<T>(path, body);
            break;
          case "PUT":
            result = await apiPut<T>(path, body);
            break;
          case "DELETE":
            result = await apiDelete<T>(path);
            break;
        }
        if (mountedRef.current) {
          setState({ data: result, error: null, loading: false });
        }
        if (options?.showSuccess) {
          toast.success(options.successMsg || "Done!");
        }
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        if (mountedRef.current) {
          setState({ data: null, error: msg, loading: false });
        }
        if (options?.showError !== false) {
          toast.error(msg);
        }
        throw err;
      }
    },
    []
  );

  const get = useCallback(
    (path: string, opts?: Parameters<typeof execute>[3]) => execute("GET", path, undefined, opts),
    [execute]
  );

  const post = useCallback(
    (path: string, body?: unknown, opts?: Parameters<typeof execute>[3]) =>
      execute("POST", path, body, opts),
    [execute]
  );

  const put = useCallback(
    (path: string, body?: unknown, opts?: Parameters<typeof execute>[3]) =>
      execute("PUT", path, body, opts),
    [execute]
  );

  const del = useCallback(
    (path: string, opts?: Parameters<typeof execute>[3]) => execute("DELETE", path, undefined, opts),
    [execute]
  );

  const refresh = useCallback(
    (path: string, opts?: Parameters<typeof execute>[3]) => execute("GET", path, undefined, opts),
    [execute]
  );

  const setData = useCallback((data: T | null) => {
    setState((s) => ({ ...s, data }));
  }, []);

  return {
    ...state,
    get,
    post,
    put,
    del,
    refresh,
    setData,
    execute,
  };
}
