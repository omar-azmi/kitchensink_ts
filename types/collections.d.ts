/** a double-ended circular queue, similar to python's `collection.deque` */
export declare class Deque<T> {
    length: number;
    private items;
    private front;
    private back;
    count: number;
    /** a double-ended circular queue, similar to python's `collection.deque` <br>
     * @param length maximum length of the queue. <br>
     * pushing more items than the length will remove the items from the opposite side, so as to maintain the size
    */
    constructor(length: number);
    /** iterate over the items in this deque, starting from the rear-most item, and ending at the front-most item */
    [Symbol.iterator]: () => {
        next: () => {
            value: T | undefined;
            done: boolean;
        };
    };
    /** inserts one or more items to the back of the deque. <br>
     * if the deque is full, it will remove the front item before adding a new item
    */
    pushBack(...items: T[]): void;
    /** inserts one or more items to the front of the deque. <br>
     * if the deque is full, it will remove the rear item before adding a new item
    */
    pushFront(...items: T[]): void;
    /** get the item at the back of the deque without removing/popping it */
    getBack(): T | undefined;
    /** get the item at the front of the deque without removing/popping it */
    getFront(): T | undefined;
    /** removes/pops the item at the back of the deque and returns it */
    popBack(): T | undefined;
    /** removes/pops the item at the front of the deque and returns it */
    popFront(): T | undefined;
    /** rotates the deque `steps` number of positions to the right. <br>
     * if `steps` is negative, then it will rotate in the left direction. <br>
     * when the deque is not empty, rotating with `step = 1` is equivalent to `this.pushBack(this.popFront())`
    */
    rotate(steps: number): void;
    /** reverses the order of the items in the deque. */
    reverse(): void;
    /** provide an index with relative to `this.back + 1`, and get the appropriate resolved index `i` that can be used to retrieve `this.items[i]`. <br>
     * example: `this.items[this.resolveIndex(0)] === "rear most element of the deque"`
     * example: `this.items[this.resolveIndex(5)] === "fifth element ahead of the rear of the deque"`
    */
    private resolveIndex;
    /** returns the item at the specified index.
     * @param index The index of the item to retrieve, relative to the rear-most element
     * @returns The item at the specified index, or `undefined` if the index is out of range
    */
    at: (index: number) => T | undefined;
    /** replaces the item at the specified index with a new item. */
    replace(index: number, item: T): void;
    /** inserts an item at the specified index, shifting all items ahead of it one position to the front. <br>
     * if the deque is full, it removes the front item before adding the new item.
    */
    insert(index: number, item: T): void;
}
