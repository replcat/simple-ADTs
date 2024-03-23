import { fc, it } from "@fast-check/vitest"
import { describe, expect, expectTypeOf } from "vitest"
import { nonnullable_values } from "./helpers/arbitraries.js"

import { constructors } from "../lib.js"
const { Base, Maybe, Result, Some, None, Fail } = constructors

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

  describe("on None", () => {
    it("throws a generic error", () => {
      expect(() => None().unwrap()).toThrowError(
        new TypeError(`Unwrapped an empty None`),
      )
    })
  })

  describe("on Fail", () => {
    it("throws the wrapped error", () => {
      expect(() => Fail("cool error").unwrap()).toThrowError("cool error")
    })
  })
})
