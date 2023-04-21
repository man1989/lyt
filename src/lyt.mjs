import chalk from "chalk";
import { Stack } from "./helpers.mjs";
import matchers from "./matchers.mjs";

const test = {
    totalSpec: 0,
    failedSpec: 0,
    parent: {
        stack: new Stack()
    },

    ctx: {
        level: -1,
        block: "",
        beforeEachArray: [],
        afterEachArray: [],
        describes: [],
        descIndex: 0,
    },

    beforeEach(cb) {
        let parent = test.parent.stack.top() || test.ctx;
        if (parent && parent.block && parent.block != "describe") {
            throw new Error("can only be nested under describe");
        }
        parent.beforeEachArray.push(cb);
    },

    afterEach(cb) {
        let parent = test.parent.stack.top() || test.ctx;
        if (parent && parent.block && parent.block != "describe") {
            throw new Error("can only be nested under describe");
        }
        parent.afterEachArray.push(cb);
    },

    describe(name, fn) {
        let parent = test.parent.stack.top() || test.ctx;
        if (parent && parent.block && parent.block != "describe") {
            throw new Error("can only be nested under describe");
        }

        let tmp = {
            level: parent.level + 1,
            name: name,
            describes: [],
            beforeEachArray: [],
            afterEachArray: [],
            its: [],
            block: "describe"
        };
        parent.describes.push(tmp);
        test.parent.stack.push(tmp);
        console.log(`${new Array(tmp.level * 2).fill(" ").join("")}${name}`);
        try {
            fn();
        } catch (err) {
            console.log(`${new Array(tmp.level * 2).fill("   ").join("")}${err}`)
        }
        test.parent.stack.pop();
    },

    it(name, fn) {
        let parent = test.parent.stack.top();
        if (!parent || parent.block !== "describe") {
            throw new Error("should be inside describe function");
        }
        let tmp = {
            level: parent.level + 1,
            name: name,
            block: "it",
            expects: [],
            pass: true
        };
        try {
            test.parent.stack.forEach((node) => {
                if (node.beforeEachArray) {
                    for (let i = 0; i < node.beforeEachArray.length; i++) {
                        node.beforeEachArray[i]()
                    }
                }
            });
            parent.its.push(tmp);
            test.parent.stack.push(tmp);
            test.totalSpec++;
            console.log(`${new Array(tmp.level * 2).fill(" ").join("")}${name}`)
            fn();
        } catch (err) {
            test.failedSpec++;
            tmp.pass = false;
            console.log(chalk.red(`${new Array(tmp.level * 2).fill("   ").join("")}${err}`))
        }
        test.parent.stack.pop(tmp);
    },

    expect(actual) {
        let parent = test.parent.stack.top();
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

export const { describe, it, expect, beforeEach, afterEach } = test