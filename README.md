# jsonlines

This is forked from [ayame113/jsonlines](https://github.com/ayame113/jsonlines).

[![JSR](https://jsr.io/badges/@kyoh86/jsonlines)](https://jsr.io/@kyoh86/jsonlines)
[![JSR doc](https://jsr.io/@kyoh86/jsonlines/doc/badge)](https://jsr.io/@kyoh86/jsonlines/doc)
[![ci](https://github.com/kyoh86/deno-jsonlines/actions/workflows/ci.yml/badge.svg)](https://github.com/kyoh86/deno-jsonlines/actions)
[![codecov](https://codecov.io/gh/kyoh86/deno-jsonlines/branch/main/graph/badge.svg?token=GsQ5af4QLn)](https://codecov.io/gh/kyoh86/deno-jsonlines)
![GitHub Sponsors](https://img.shields.io/github/sponsors/kyoh86)

Web stream based jsonlines decoder/encoder

This library supports JSON in the following formats:

- Line-delimited JSON (JSONLinesParseStream)
  - NDJSON
  - JSON lines
- Record separator-delimited JSON (JSONLinesParseStream)
- Concatenated JSON (ConcatenatedJSONParseStream)

See [wikipedia](https://en.wikipedia.org/wiki/JSON_streaming) for the
specifications of each JSON.

## install or import

https://jsr.io/@kyoh86/jsonlines

```ts
import {
  ConcatenatedJSONParseStream,
  ConcatenatedJSONStringifyStream,
  JSONLinesParseStream,
  JSONLinesStringifyStream,
} from "@kyoh86/jsonlines";
```

## Usage

A working example can be found at [./testdata/test.ts](./testdata/test.ts).

### How to parse JSON Lines

./json-lines.jsonl

```json
{"some":"thing"}
{"foo":17,"bar":false,"quux":true}
{"may":{"include":"nested","objects":["and","arrays"]}}
```

```ts
import { JSONLinesParseStream } from "@kyoh86/jsonlines";

const { body } = await fetch(
  "https://jsr.io/@kyoh86/jsonlines/1.3.0/testdata/json-lines.jsonl",
);

const readable = body!
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new JSONLinesParseStream());

for await (const data of readable) {
  console.log(data);
}
```

### How to parse json-seq

./json-seq.json-seq

```json
{"some":"thing\n"}
{
  "may": {
    "include": "nested",
    "objects": [
      "and",
      "arrays"
    ]
  }
}
```

```ts
import { JSONLinesParseStream } from "@kyoh86/jsonlines";

const { body } = await fetch(
  "https://jsr.io/@kyoh86/jsonlines/1.3.0/testdata/json-seq.json-seq",
);

const recordSeparator = "\x1E";
const readable = body!
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new JSONLinesParseStream({ separator: recordSeparator }));

for await (const data of readable) {
  console.log(data);
}
```

### How to parse concat-json

./concat-json.concat-json

```json
{"foo":"bar"}{"qux":"corge"}{"baz":{"waldo":"thud"}}
```

```ts
import { ConcatenatedJSONParseStream } from "@kyoh86/jsonlines";

const { body } = await fetch(
  "https://jsr.io/@kyoh86/jsonlines/1.3.0/testdata/concat-json.concat-json",
);

const readable = body!
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new ConcatenatedJSONParseStream());

for await (const data of readable) {
  console.log(data);
}
```

### How to stringify JSON Lines

```ts
import { JSONLinesStringifyStream } from "@kyoh86/jsonlines";

const file = await Deno.open(new URL("./tmp.concat-json", import.meta.url), {
  create: true,
  write: true,
});

ReadableStream.from([{ foo: "bar" }, { baz: 100 }])
  .pipeThrough(new JSONLinesStringifyStream())
  .pipeThrough(new TextEncoderStream())
  .pipeTo(file.writable)
  .then(() => console.log("write success"));
```

### How to stringify json-seq

```ts
import { JSONLinesStringifyStream } from "@kyoh86/jsonlines";

const recordSeparator = "\x1E";
const file = await Deno.open(new URL("./tmp.concat-json", import.meta.url), {
  create: true,
  write: true,
});

ReadableStream.from([{ foo: "bar" }, { baz: 100 }])
  .pipeThrough(new JSONLinesStringifyStream({ separator: recordSeparator }))
  .pipeThrough(new TextEncoderStream())
  .pipeTo(file.writable)
  .then(() => console.log("write success"));
```

### How to stringify concat-json

```ts
import { ConcatenatedJSONStringifyStream } from "@kyoh86/jsonlines";

const file = await Deno.open(new URL("./tmp.concat-json", import.meta.url), {
  create: true,
  write: true,
});

ReadableStream.from([{ foo: "bar" }, { baz: 100 }])
  .pipeThrough(new ConcatenatedJSONStringifyStream())
  .pipeThrough(new TextEncoderStream())
  .pipeTo(file.writable)
  .then(() => console.log("write success"));
```
