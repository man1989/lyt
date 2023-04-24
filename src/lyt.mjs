import chalk from "chalk";
import { Stack } from "./helpers.mjs";
import matchers from "./matchers.mjs";

class Lyt {
    #totalSpec;
    #failedSpec;
    #parent = {
        stack: new Stack()
    };

    #ctx = {
        level: -1,
        block: "",
        beforeAllArray: [],
        afterAllArray: [],
        beforeEachArray: [],
        afterEachArray: [],
        describes: [],
        descIndex: 0,
    };

    constructor() {
        this.#totalSpec = 0;
        this.#failedSpec = 0;
    }
    
    #noop() { }
    
    #executeBeforeAllCb(parent, cbArray) {
        if (!parent.skipped) {
            cbArray = cbArray || [];
            for (let i = 0; i < cbArray.length; i++) {
                cbArray[i]()
            }
        }
    }

    #executeBeforeEach() {
        this.#parent.stack.forEach(function (node) {
            if (!node.skipped && node.beforeEachArray && node.beforeEachArray.length) {
                for (let i = 0; i < node.beforeEachArray.length; i++) {
                    node.beforeEachArray[i]();
                }
            }
        });
    }

    #executeAfterEach() {
        this.#parent.stack.forEach(function (node) {
            if (!node.skipped && node.afterEachArray && node.afterEachArray.length) {
                for (let i = 0; i < node.afterEachArray.length; i++) {
                    node.afterEachArray[i]();
                }
            }
        });
    }

    #messageFormatter(node, noStatus=false){
        let status = !noStatus ? (node.passed ? chalk.green('√') : chalk.red('X')) : "";
        let name = node.skipped ? `${chalk.yellow(node.pendingStatus, node.name)}` : `${status} ${node.name}`;
        return `${new Array(node.level * 2).fill(" ").join("")}${name}`;
    }

    #executeSpecs(parent) {
        let failedMessage = "";
        if (parent.its && parent.its.length) {
            for (let i = 0; i < parent.its.length; i++) {
                let it = parent.its[i];
                this.#parent.stack.push(it);
                if(!it.skipped){
                    try {
                        this.#executeBeforeEach();
                        it.fn();
                        this.#executeAfterEach();
                        this.#totalSpec++;
                    } catch (err) {
                        this.#failedSpec++;
                        it.passed = false;
                        failedMessage = chalk.red(`${new Array(it.level * 2).fill("   ").join("")}${err}`);
                    }
                }
                let successMessage = this.#messageFormatter(it);
                console.log(successMessage);
                if (failedMessage) {
                    console.log(failedMessage);
                }
                this.#parent.stack.pop();
            }
        }
    }

    #executeTree(node) {
        if (!node.fn) {
            return;
        }
        this.#parent.stack.push(node);
        const msg = chalk.bold(this.#messageFormatter(node, true));
        console.log(msg);
        node.fn();
        this.#executeBeforeAllCb(node, node.beforeAllArray);
        this.#executeSpecs(node);
        for (let i = 0; i < node.describes.length; i++) {
            let desc = node.describes[i];
            this.#executeTree(desc);
        }
        this.#parent.stack.pop();
    }

    beforeAll(cb) {
        let parent = this.#parent.stack.top() || this.#ctx;
        if (parent && parent.block && parent.block != "describe") {
            throw new Error("can only be nested under describe");
        }
        parent.beforeAllArray.push(cb);
    }

    beforeEach(cb) {
        let parent = this.#parent.stack.top() || this.#ctx;
        if (parent && parent.block && parent.block != "describe") {
            throw new Error("can only be nested under describe");
        }
        parent.beforeEachArray.push(cb);
    }

    afterEach(cb) {
        let parent = this.#parent.stack.top() || this.#ctx;
        if (parent && parent.block && parent.block != "describe") {
            throw new Error("can only be nested under describe");
        }
        parent.afterEachArray.push(cb);
    }

    describe(name, fn) {
        let parent = this.#parent.stack.top() || this.#ctx;
        if (parent && parent.block && parent.block != "describe") {
            throw new Error("can only be nested under describe");
        }
        let isSkipped = parent.skipped || false;
        let tmp = {
            level: parent.level + 1,
            name: name,
            describes: [],
            beforeAllArray: [],
            afterAllArray: [],
            beforeEachArray: [],
            afterEachArray: [],
            its: [],
            block: "describe",
            skipped: isSkipped,
            passed: true,
            pendingStatus: ""
        };
        parent.describes.push(tmp);;
        tmp.fn = fn.bind(this)
        if (tmp.level === 0) {
            this.#executeTree(tmp)
        }
    }

    xdescribe(name, fn) {
        let parent = this.#parent.stack.top() || this.#ctx;
        parent.skipped = true;
        this.describe(name, fn);
        parent.skipped = false;
    }

    it(name, fn) {
        let parent = this.#parent.stack.top();
        if (!parent || parent.block !== "describe") {
            throw new Error("should be inside describe function");
        }
        let isSkipped = parent.skipped || !fn || false;
        let tmp = {
            level: parent.level + 1,
            name: name,
            block: "it",
            expects: [],
            fn: isSkipped ? this.#noop : fn.bind(this),
            passed: true,
            skipped: isSkipped,
            pendingStatus: "\u25CB"
        };
        parent.its.push(tmp);
    }

    xit(name) {
        this.it(name);
    }

    expect(actual) {
        let parent = this.#parent.stack.top();
        if (!parent || parent.block !== "it") {
            throw new Error("should be inside spec function");
        }
        let tmp = {
            level: parent.level + 1,
            actual: actual,
            block: "expect"
        }
        parent.expects.push(tmp);
        return matchers(actual);
    }
}

const lytTest = new Proxy(new Lyt(), {
    get(target, prop) {
        let value = target[prop];
        if (value instanceof Function) {
            return function (...args) {
                return value.apply(target, args)
            }
        }
        return value;
    }
});

export default lytTest;