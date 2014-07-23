# Mochafe

[![Build Status](https://travis-ci.org/nowk/mochafe.js.svg?branch=master)](https://travis-ci.org/nowk/mochafe.js)
[![Code Climate](https://codeclimate.com/github/nowk/mochafe.js.png)](https://codeclimate.com/github/nowk/mochafe.js)
[![David DM](https://david-dm.org/nowk/mochafe.js.png)](https://david-dm.org/nowk/mochafe.js)

[Mocha](https://github.com/visionmedia/mocha) with steps.

## Install

    npm install mochafe --save-dev

## Usage

    var Mochafe = require("mochafe");

    describe("Feature title", function() {
      var fe = new Mochafe();

      fe.steps("a > b", function(a, b) {
        assert(a > b);
      });

      fe.steps("b < c", function(b, c) {
        assert(b < c);
      });

      it("acts as a scenario title", function() {
        fe.step("a > b", 2, 1);
        fe.step("a > b", 3, 2);
        fe.step("b < c", 4, 5);
      });
    });

---

Async steps are created by passing `true` as the first argument in the `steps` method. This will automatically append a `next` argument which you can call when your async process has finished. 

*`next` argument can be named whatever you want.*

    describe("Feature title", function() {
      var fe = new Mochafe();
      var start = Date.now();
      var stop;

      fe.steps(true, "will takes some time", function(a, b, c, next) {
        setTimeout(function() {
          assert.equal(a, "A");
          assert.equal(b, "B");
          assert.equal(c, "C");
          stop = Date.now();
          next();
        }, 1000);
      });

      fe.steps("has taken at least about a second", function() {
        assert(stop-start > 999);
      });

      it("acts as a scenario title", function(done) {
        fe.step("will takes some time", "A", "B", "C");
        fe.step("has taken at least about a second");
        fe.step(done);
      });
    });

---

Steps can be saved in "global" export files and imported as required.

    module.exports = {
      "I will use this step alot": function(a, b) {
        assert.equal(a, b);
      },
      "This one is async": [true, function(a, b) {
        assert(a > b);
      }]
    }

    var globalSteps = require("./global_steps");

    var fe = new Mochafe({
      steps: [
        globalSteps
      ]
    });


---

### TODO

* Set `context` (`this`) so steps are executed against said `context`.

---

### License

MIT
