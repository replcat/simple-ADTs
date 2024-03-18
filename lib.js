/** @type {ADT.Constructors} */
// @ts-ignore
const ADT = () => {
  const base = {
    map(fn) {
      return this.constructor(fn(this.value))
    },
  }

  function Just(value) {
    return Object.create(Just.prototype, {
      value: { value, writable: true, enumerable: true },
    })
  }

  Just.prototype = Object.create(base)
  Just.prototype.constructor = Just

  function Nothing() {
    return Object.create(Nothing.prototype)
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
}

export { ADT }
