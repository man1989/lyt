# lyt
lyt a unit test module

## Example
```javascript
import {describe, it, expect, beforeEach, afterEach} from "lyt";

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
});
```
