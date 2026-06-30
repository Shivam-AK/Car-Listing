import { useState } from "react";
import { toast } from "sonner";

export default function useFetch(cb) {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);
    setData(undefined);

    try {
      const response = await cb(...args);
      if (response.success) {
        setData(response);
      } else {
        setError(response);
        toast.error(response.message);
      }
    } catch (error) {
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
}
