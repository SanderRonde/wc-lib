export function getOrCreate<V>(creator: () => V): V {
    let hasValue: boolean = false;
    let value: V | null = null;
    if (hasValue) return value!;
    hasValue = true;
    return (value = creator());
}
