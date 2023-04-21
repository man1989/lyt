class Stack {
    constructor() {
        this.list = []
    }

    push(d) {
        this.list.push(d);
    }

    pop() {
        return this.list.pop();
    }

    size() {
        return this.list.length;
    }

    top() {
        if (!this.isEmpty()) {
            return this.list[this.list.length - 1];
        }
    }

    isEmpty() {
        this.list.length === 0;
    }

    forEach(cb) {
        for (let i = 0; i < this.list.length; i++) {
            cb(this.list[i], i, this.list)
        }
    }
}

export {Stack}