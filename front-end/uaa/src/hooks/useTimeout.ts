import { useCallback, useEffect, useRef } from 'react';

/**
  tạo một hook để tạo timeout.

  ```tsx
  import { useTimeout } from "../../hooks";

  function SomeComponent() {
    const [count, setCount] = useState(10)
    const { clear, reset } = useTimeout(() => setCount(0), 1000)

    return (
        <div>
        <div>{count}</div>
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
            <button onClick={clear}>Clear Timeout</button>
            <button onClick={reset}>Reset Timeout</button>
        </div>
    )
  }
  ```
 */
export default function useTimeout(callback: () => void, delay: number) {
    const callbackRef = useRef(callback);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const set = useCallback(() => {
        timeoutRef.current = setTimeout(() => callbackRef.current(), delay);
    }, [delay]);

    const clear = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        set();
        return clear;
    }, [delay, set, clear]);

    const reset = useCallback(() => {
        clear();
        set();
    }, [clear, set]);

    return {
        reset,
        clear,
    };
}