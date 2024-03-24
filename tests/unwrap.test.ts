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

describe("unwrap_or", () => {
  describe("on Some", () => {
    it("returns wrapped values", () => {
      expect(Some("test").unwrap_or("fallback")).toBe("test")
    })

    it("types wrapped values", () => {
      let some = Some("test" as string)
      let unwrapped = some.unwrap_or("fallback")
      expectTypeOf(unwrapped).toEqualTypeOf<string>()
      expect(unwrapped).toBe("test")
    })
  })

  describe("on None", () => {
    it("returns the fallback value", () => {
      expect(None().unwrap_or("fallback")).toBe("fallback")
    })

    it("types the fallback value", () => {
      let none = None()
      let unwrapped = none.unwrap_or("fallback" as string)
      expectTypeOf(unwrapped).toEqualTypeOf<string>()
      expect(unwrapped).toBe("fallback")
    })
  })

  describe("on Fail", () => {
    it("returns the fallback value", () => {
      expect(Fail("cool error").unwrap_or("fallback")).toBe("fallback")
    })
  })
})

describe("unwrap_or_else", () => {
  describe("on Some", () => {
    it("returns wrapped values", () => {
      expect(Some("test").unwrap_or_else(() => "fallback")).toBe("test")
    })

    it("types wrapped values", () => {
      let some = Some("test" as string)
      let unwrapped = some.unwrap_or_else(() => "fallback")
      expectTypeOf(unwrapped).toEqualTypeOf<string>()
      expect(unwrapped).toBe("test")
    })
  })

  describe("on None", () => {
    it("returns the fallback value", () => {
      expect(None().unwrap_or_else(() => "fallback")).toBe("fallback")
    })

    it("types the fallback value", () => {
      let none = None()
      let unwrapped = none.unwrap_or_else(() => "fallback" as string)
      expectTypeOf(unwrapped).toEqualTypeOf<string>()
      expect(unwrapped).toBe("fallback")
    })
  })

  describe("on Fail", () => {
    it("returns the fallback value", () => {
      expect(Fail("cool error").unwrap_or_else(() => "fallback")).toBe("fallback")
    })
  })
})
