
import chalk from "chalk";

export default function matchers(actual) {
    return {
        toBe(expected) {
            if (actual !== expected) {
                throw `expect ${actual} to be ${expected}`
            }
        },
        toBeDefined(){
            if (actual == undefined) {
                throw `expect ${actual} to be defined`;
            }
        },

        toEqual(value){
            if(typeof actual != "object" && typeof value != "object"){
                return this.toBe(value);
            }
            let newActual = "";
            if(typeof actual == "object"){
                newActual = JSON.stringify(actual);
            }
            if(typeof value == "object"){
                value = JSON.stringify(value);
            }
            if (newActual != value) {
                throw `expect ${chalk.bold(actual)} to be equal to ${chalk.red(value)}`;
            }            
        }
    };
}