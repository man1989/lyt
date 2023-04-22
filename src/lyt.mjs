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
        beforeAllArray:[],
        afterAllArray:[],
        beforeEachArray: [],
        afterEachArray: [],
        describes: [],
        descIndex: 0,
    },

    beforeAll(cb){
        let parent = test.parent.stack.top() || test.ctx;
        if (parent && parent.block && parent.block != "describe") {
            throw new Error("can only be nested under describe");
        }
        parent.beforeAllArray.push(cb);
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

    executeBeforeAllCb(cbArray){
        cbArray = cbArray || [];
        for(let i=0; i < cbArray.length; i++){
            cbArray[i]()
        }
    },

    executeBeforeEach(cbArray = []){
        test.parent.stack.forEach(function(node){
            if(node.beforeEachArray && node.beforeEachArray.length){
                for(let i=0; i<node.beforeEachArray.length; i++){
                    node.beforeEachArray[i]();
                }
            }
        });
    },

    executeAfterEach(){
        test.parent.stack.forEach(function(node){
            if(node.afterEachArray && node.afterEachArray.length){
                for(let i=0; i<node.afterEachArray.length; i++){
                    node.afterEachArray[i]();
                }
            }
        });
    },
    
    executeSpecs(node){
        if(node.its && node.its.length){
            for(let i=0; i<node.its.length; i++){
                let passed = true;
                let failedMessage = ""
                let it = node.its[i];
                test.parent.stack.push(it);
                try{
                    this.executeBeforeEach();
                    it.fn();
                    this.executeAfterEach();
                    this.totalSpec++;
                }catch(err){
                    this.failedSpec++;
                    passed = false;
                    failedMessage = chalk.red(`${new Array(it.level * 2).fill("   ").join("")}${err}`);
                }
                let status = !failedMessage ? chalk.green('√') : chalk.red('X')
                console.log(`${new Array(it.level * 2).fill(" ").join("")}${status} ${it.name}`);
                if(failedMessage){
                    console.log(failedMessage)
                }
                test.parent.stack.pop();
            }
        }            
    },
    
    executeTree(node){
        if(!node.fn){
            return;
        }
        test.parent.stack.push(node);
        console.log(chalk.bold(`${new Array(node.level * 2).fill(" ").join("")}${node.name}`));
        node.fn();
        this.executeBeforeAllCb(node.beforeAllArray);
        this.executeSpecs(node);
        for(let i=0; i<node.describes.length; i++){
            let desc = node.describes[i];
            this.executeTree(desc);
        }
        test.parent.stack.pop();
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
            beforeAllArray:[],
            afterAllArray:[],                
            beforeEachArray: [],
            afterEachArray: [],
            its: [],
            block: "describe"
        };
        parent.describes.push(tmp);;
        tmp.fn = fn.bind(this)
        if(tmp.level === 0){
            test.executeTree(tmp)
        }
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
            fn: fn.bind(this),
            pass: true
        };
        parent.its.push(tmp);
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

export const {describe, it, expect, beforeAll, beforeEach, afterEach} = test;