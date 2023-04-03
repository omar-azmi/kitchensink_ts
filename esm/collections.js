var _a;
import { modulo } from "./numericmethods.js";
/** a double-ended circular queue, similar to python's `collection.deque` */
export class Deque {
    /** a double-ended circular queue, similar to python's `collection.deque` <br>
     * @param length maximum length of the queue. <br>
     * pushing more items than the length will remove the items from the opposite side, so as to maintain the size
    */
    constructor(length) {
        Object.defineProperty(this, "length", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: length
        });
        Object.defineProperty(this, "items", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "front", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "back", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "count", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        /** iterate over the items in this deque, starting from the rear-most item, and ending at the front-most item */
        Object.defineProperty(this, _a, {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                const { at, count } = this;
                let i = 0;
                return {
                    next: () => i < count ?
                        { value: at(i++), done: false } :
                        { value: undefined, done: true }
                };
            }
        });
        /** provide an index with relative to `this.back + 1`, and get the appropriate resolved index `i` that can be used to retrieve `this.items[i]`. <br>
         * example: `this.items[this.resolveIndex(0)] === "rear most element of the deque"`
         * example: `this.items[this.resolveIndex(5)] === "fifth element ahead of the rear of the deque"`
        */
        Object.defineProperty(this, "resolveIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (index) => modulo(this.back + index + 1, this.length)
        });
        /** returns the item at the specified index.
         * @param index The index of the item to retrieve, relative to the rear-most element
         * @returns The item at the specified index, or `undefined` if the index is out of range
        */
        Object.defineProperty(this, "at", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (index) => this.items[this.resolveIndex(index)]
        });
        this.items = Array(length);
        this.back = length - 1;
    }
    /** inserts one or more items to the back of the deque. <br>
     * if the deque is full, it will remove the front item before adding a new item
    */
    pushBack(...items) {
        for (const item of items) {
            if (this.count === this.length)
                this.popFront();
            this.items[this.back] = item;
            this.back = modulo(this.back - 1, this.length);
            this.count++;
        }
    }
    /** inserts one or more items to the front of the deque. <br>
     * if the deque is full, it will remove the rear item before adding a new item
    */
    pushFront(...items) {
        for (const item of items) {
            if (this.count === this.length)
                this.popBack();
            this.items[this.front] = item;
            this.front = modulo(this.front + 1, this.length);
            this.count++;
        }
    }
    /** get the item at the back of the deque without removing/popping it */
    getBack() {
        if (this.count === 0)
            return undefined;
        return this.items[modulo(this.back + 1, this.length)];
    }
    /** get the item at the front of the deque without removing/popping it */
    getFront() {
        if (this.count === 0)
            return undefined;
        return this.items[modulo(this.front - 1, this.length)];
    }
    /** removes/pops the item at the back of the deque and returns it */
    popBack() {
        if (this.count === 0)
            return undefined;
        this.back = modulo(this.back + 1, this.length);
        const item = this.items[this.back];
        this.items[this.back] = undefined;
        this.count--;
        return item;
    }
    /** removes/pops the item at the front of the deque and returns it */
    popFront() {
        if (this.count === 0)
            return undefined;
        this.front = modulo(this.front - 1, this.length);
        const item = this.items[this.front];
        this.items[this.front] = undefined;
        this.count--;
        return item;
    }
    /** rotates the deque `steps` number of positions to the right. <br>
     * if `steps` is negative, then it will rotate in the left direction. <br>
     * when the deque is not empty, rotating with `step = 1` is equivalent to `this.pushBack(this.popFront())`
    */
    rotate(steps) {
        const { front, back, length, count, items } = this;
        if (count === 0)
            return;
        steps = modulo(steps, count);
        if (count < length) {
            // move `steps` number of items from the front to the rear
            for (let i = 0; i < steps; i++) {
                const b = modulo(back - i, length), f = modulo(front - i - 1, length);
                items[b] = items[f];
                items[f] = undefined;
            }
        }
        this.front = modulo(front - steps, length);
        this.back = modulo(back - steps, length);
    }
    /** reverses the order of the items in the deque. */
    reverse() {
        const center = (this.count / 2) | 0, { length, front, back, items } = this;
        for (let i = 1; i <= center; i++) {
            const b = modulo(back + i, length), f = modulo(front - i, length), temp = items[b];
            items[b] = items[f];
            items[f] = temp;
        }
    }
    /** replaces the item at the specified index with a new item. */
    replace(index, item) {
        // note that replacing does not increment the indexes of `front` and `back`.
        this.items[modulo(this.back + index + 1, this.count)] = item;
    }
    /** inserts an item at the specified index, shifting all items ahead of it one position to the front. <br>
     * if the deque is full, it removes the front item before adding the new item.
    */
    insert(index, item) {
        if (this.count === this.length)
            this.popFront();
        const i = this.resolveIndex(index);
        // `this.items[this.front]` is guaranteed to be empty. so now we push everything ahead of the insertion index `i` one step into the front to make room for the insertion
        for (let j = this.front; j > i; j--)
            this.items[j] = this.items[j - 1];
        this.items[i] = item;
        this.count++;
    }
}
_a = Symbol.iterator;
