/** @type {Constructors} */
// @ts-ignore
const ADT = (() => {
  const base = {
    isa(constructor) {
      return this instanceof constructor
    },
    map(fn) {
      return this.constructor(fn(this.value))
    },
  }

  function Just(value) {
    return Object.create(Just.prototype, {
      value: { value, enumerable: true },
      of: { value: Just },
    })
  }

  Just.prototype = Object.create(base)
  Just.prototype.constructor = Just

  function Nothing() {
    return Object.create(Nothing.prototype, {
      of: { value: Nothing },
    })
  }

  Nothing.prototype = Object.create(base)
  Nothing.prototype.constructor = Nothing

  Nothing.prototype.map = function(fn) {
    return this
  }

  return {
    Just,
    Nothing,
  }
})()

export { ADT }
