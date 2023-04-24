# lyt
lyt a unit test module

## Installation
```
  npm i  https://github.com/man1989/lyt.git
```

## Example
```javascript
import lytTest from "lyt";
const {describe, it, expect, beforeEach, afterEach} = lytTest;

describe("Suite", function(){
    beforeEach(function(){
        // run before each spec
    });
    afterEach(function(){
        // run after each spec
    });

    it("Spec", function(){
        expect(1).toBe(1)
    });
    
    xit("skipped Spec", function(){
        expect(1).toBe(1)
    });
});

xdescribe("Skipped Suite", function(){
    // this spec willbe be skipped as well
    it("spec", function(){
        expect(1).toBe(1);
    })
});
```
