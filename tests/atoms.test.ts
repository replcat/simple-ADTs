import { assert, assertType, describe, expect, expectTypeOf, test } from "vitest"
import { None, Some } from "../lib.js"

describe("constructors", () => {
  test("Some", () => {
    let some = Some(1)

    expect(some).toBeInstanceOf(Some)
    expect(some).not.toBeInstanceOf(None)

    expect(some).toMatchObject({ value: 1 })
    expectTypeOf(some).toMatchTypeOf<Some<number>>()
  })

  test("None", () => {
    let none = None()

    expect(none).toBeInstanceOf(None)
    expect(none).not.toBeInstanceOf(Some)

    expectTypeOf(none).toMatchTypeOf<None>()
  })
})

describe("map", () => {
  describe("with a type-preserving function", () => {
    test("Some", () => {
      let some = Some(1)
      let result = some.map(value => value + 1)
      expect(result).toBeInstanceOf(Some)
      expectTypeOf(result).toMatchTypeOf<Some<number>>()
      expect(result.value).toBe(2)
    })

    test("None", () => {
      let none = None()
      let result = none.map(value => value + 1)
      expect(result).toBeInstanceOf(None)
      expectTypeOf(result).toMatchTypeOf<None>()
    })
  })

  describe("with a type-modifying function", () => {
    test("Some", () => {
      let some = Some(1)
      let result = some.map(value => String(value))
      expect(result).toBeInstanceOf(Some)
      expectTypeOf(result).toMatchTypeOf<Some<string>>()
      expect(result.value).toBe("1")
    })

    test("None", () => {
      let none = None()
      let result = none.map(value => String(value))
      expect(result).toBeInstanceOf(None)
      expectTypeOf(result).toMatchTypeOf<None>()
    })
  })
})

describe("array of Some and None", () => {
  let array = [Some(1), None(), Some(2)]

  test("has the expected type", () => {
    expectTypeOf(array).toMatchTypeOf<Array<Some<number> | None>>()
  })

  test("can be mapped (type-preserving)", () => {
    let add_one = (value: number) => value + 1
    let result = array.map(value => value.map(add_one))
    expect(result).toMatchObject([Some(2), None(), Some(3)])
    expectTypeOf(result).toMatchTypeOf<Array<Some<number> | None>>()
  })

  test("can be mapped (type-modifying)", () => {
    let stringify = (value: number) => String(value)
    let result = array.map(value => value.map(stringify))
    expect(result).toMatchObject([Some("1"), None(), Some("2")])
    expectTypeOf(result).toMatchTypeOf<Array<Some<string> | None>>()
  })

  // test("can be filtered", () => {
  //   let result = array.filter(value => value instanceof Some)
  //   expect(result).toMatchObject([Some(1), Some(2)])
  //   expectTypeOf(result).toMatchTypeOf<Array<Some<number>>>()
  // })
})

test("isa", () => {
  let option = Math.random() > 0.5 ? Some(1) : None()
  expectTypeOf(option).toMatchTypeOf<Some<number> | None>()

  if (option.isa(None)) {
    expectTypeOf(option).toMatchTypeOf<None>()
  }

  if (option.isa(Some)) {
    expectTypeOf(option).toMatchTypeOf<Some<number>>()
  }
})

// test("using list", () => {
//   let list = List([Some(1), None(), Some(2)])
//   let result = list.filter(value => value.isa(Some))
//   expect(result).toMatchObject([Some(1), Some(2)])
//   expectTypeOf(result).toMatchTypeOf<Array<Some<number>>>()
// })

// test("name property", () => {
//   expect(Some.name).toBe("Some")
//   expect(None.name).toBe("None")
//   expect(List.name).toBe("List")
// })

// test("type property", () => {
//   const some = Some(1)
//   const thing = some.type("blep")
//   expect(thing).toBeInstanceOf(Some)
//   // expect(some.type).toBe(Some)
// })

// test("instanceof", () => {
//   console.log(Some instanceof Some)
// })
