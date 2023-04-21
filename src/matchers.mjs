
export default function matchers(actual) {
    return {
        toBe(expected) {
            if (actual !== expected) {
                throw `expect ${actual} to be ${expected}`
            }
        }
    };
}