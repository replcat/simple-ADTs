import { fc, it } from "@fast-check/vitest"
import { describe, expect, expectTypeOf } from "vitest"
import { nonnullable_values } from "./helpers/arbitraries.js"

import { constructors } from "../lib.js"
const { Nebulous, Maybe, Result, Some, None, Fail } = constructors

describe("unwrap", () => {
  describe("on Some", () => {
    it.prop([nonnullable_values])("returns wrapped values", (value: any) => {
      expect(Some(value).unwrap()).toBe(value)
    })

    it("types wrapped values", () => {
      let some = Some("test" as string)
      let unwrapped = some.unwrap()
      expectTypeOf(unwrapped).toEqualTypeOf<string>()
      expect(unwrapped).toBe("test")
    })
  })

  describe.each([None, Fail])("on Empty types", empty => {
    it("throws an error", () => {
      expect(() => empty().unwrap()).toThrowError(
        new TypeError(`Unwrapped an empty ${empty.name}`),
      )
    })
  })
})
