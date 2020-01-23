export const SLOW = 2000;

export const RANDOM_RUNS = 100;

export function repeat(fn: () => void) {
    return () => {
        for (let i = 0; i < RANDOM_RUNS; i++) {
            fn();
        }
    };
}
