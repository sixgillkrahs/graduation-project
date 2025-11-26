import { useEffect } from 'react';
import useTimeout from './useTimeout';

/**
 * tạo một hook để tạo debounce.
 * @param callback
 * @param delay
 * @param dependencies
 * @returns
 *
 * ```tsx
 * import { useDebounce } from "../../hooks";
 *
 * function SomeComponent() {
 *   const [value, setValue] = useState("");
 *   useDebounce(() => {
 *     console.log(value);
 *   }, 500, [value]);
 *   return <input type="text" value={value} onChange={(e) => setValue(e.target.value)} />;
 * }
 * ```
 */
export default function useDebounce(
    callback: () => void,
    delay: number,
    dependencies: unknown[],
) {
    const { reset, clear } = useTimeout(callback, delay);
    useEffect(reset, [...dependencies, reset]);
    useEffect(clear, [clear]);
}