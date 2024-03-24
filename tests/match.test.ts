import { fc, test } from "@fast-check/vitest"
import { describe, expect, expectTypeOf } from "vitest"
import { nonnullable_functions, nonnullable_values } from "./helpers/arbitraries.js"

import { constructors } from "../lib.js"
const { Base, Maybe, Result, Some, None, Fail } = constructors

describe("type transformations", () => {
  test("Maybe<string> to Result<number>", () => {
    const maybe = Maybe("test")
    const result = maybe.match({
      Some: value => Some(value.length),
      None: Fail,
    })
    expectTypeOf(result).toMatchTypeOf<Result<number>>()
  })

  test("reducing Maybes to a number", () => {
    let maybes = [Some("one"), None(), Some("two")] as Maybe<string>[]
    let result = maybes.reduce(
      (acc, maybe) =>
        acc + maybe.match({
          Some: value => value.length,
          None: () => 10,
        }),
      0,
    )
    expectTypeOf(result).toEqualTypeOf<number>()
    expect(result).toBe(16)
  })
})

describe.each([
  { Type: Base },
  { Type: Maybe },
  { Type: Result },
  { Type: Some },
  { Type: None },
  { Type: Fail },
])("$Type.name", ({ Type }) => {
  test.prop([
    Type === Fail
      ? fc.oneof(fc.string(), fc.string().map(message => new Error(message)))
      : nonnullable_values,
    fc.func(nonnullable_values),
    fc.func(nonnullable_values),
    fc.func(nonnullable_values),
  ])("handles the match", (value: any, handle_some, handle_none, handle_fail) => {
    let instance = Type(Type === None ? undefined : value)

    // @ts-ignore
    let result = instance.match({
      Some: handle_some,
      None: handle_none,
      Fail: handle_fail,
    })

    if (instance.isa(Some)) expect(result).toBe(handle_some(value))
    else if (instance.isa(None)) expect(result).toBe(handle_none())
    else if (instance.isa(Fail)) expect(result).toBe(handle_fail(instance.error))
    else expect.unreachable()
  })
})

describe("errors", () => {
  test("missing match case (type error and throws)", () => {
    let some = Some(1)

    // @ts-expect-error
    expect(() => some.match({})).toThrow(TypeError)
  })

  test("unexpected match case (type error only)", () => {
    let maybe: Maybe<number>[] = []

    // @ts-expect-error
    maybe.map(m => m.match({ Fail: () => {} }))
  })
})
