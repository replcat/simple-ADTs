const base = {
  map(fn) {
    return this.value ? this.constructor(fn(this.value)) : this
  },
  isa(constructor) {
    return this instanceof constructor
  },
}

/**
 * @template T
 * @type {ADT.Some<T>}
 */
function SomeType(value) {
  return Object.create(SomeType.prototype, {
    value: { value, writable: true, enumerable: true },
  })
}

SomeType.prototype = Object.create(base)
SomeType.prototype.constructor = SomeType

/**
 * @type {ADT.None}
 */
function NoneType() {
  return Object.create(NoneType.prototype)
}

NoneType.prototype = Object.create(base)
NoneType.prototype.constructor = NoneType

NoneType.prototype.map = function(fn) {
  return this
}

// /**
//  * @template T
//  * @type {ADT.List<T>}
//  */
// function ListType(items) {
//   return Object.create(ListType.prototype, {
//     items: { value: items, writable: true, enumerable: true },
//   })
// }

// ListType.prototype.filter = function(predicate) {
//   return ListType(this.items.filter(predicate))
// }

// ListType.prototype.toArray = function() {
//   return this.items
// }

export { NoneType as None, SomeType as Some }
