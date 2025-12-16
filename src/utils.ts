export type JSONValue =
  | { [key: string]: JSONValue }
  | JSONValue[]
  | string
  | number
  | boolean;

/**
 * Convert the generator function into a TransformStream.
 *
 * ```ts
 * import { transformStreamFromGeneratorFunction } from "@kyoh86/jsonlines";
 *
 * const reader = ReadableStream.from([0, 1, 2])
 *   .pipeThrough(transformStreamFromGeneratorFunction(async function* (src) {
 *     for await (const chunk of src) {
 *       yield chunk * 100;
 *     }
 *   }));
 *
 * for await (const chunk of reader) {
 *   console.log(chunk);
 * }
 * // output: 0, 100, 200
 * ```
 *
 * @param transformer A function to transform.
 * @param writableStrategy An object that optionally defines a queuing strategy for the stream.
 * @param readableStrategy An object that optionally defines a queuing strategy for the stream.
 */
export function transformStreamFromGeneratorFunction<I, O>(
  transformer: (src: ReadableStream<I>) => Iterable<O> | AsyncIterable<O>,
  writableStrategy?: QueuingStrategy<I>,
  readableStrategy?: QueuingStrategy<O>,
): TransformStream<I, O> {
  const {
    writable,
    readable,
  } = new TransformStream<I, I>(undefined, writableStrategy);

  const iterable = transformer(readable);
  const iterator: Iterator<O> | AsyncIterator<O> =
    (iterable as AsyncIterable<O>)[Symbol.asyncIterator]?.() ??
      (iterable as Iterable<O>)[Symbol.iterator]?.();
  return {
    writable,
    readable: new ReadableStream<O>({
      async pull(controller) {
        const { done, value } = await iterator.next();
        if (done) {
          controller.close();
          return;
        }
        controller.enqueue(value);
      },
      async cancel(...args) {
        await readable.cancel(...args);
      },
    }, readableStrategy),
  };
}
