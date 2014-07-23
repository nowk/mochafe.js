/* jshint node: true */

var assert = require("chai").assert;
var Mochafe = require("..");

describe("--", function() {
  this._timeout = 4999;

  describe("#steps", function() {
    var fe = new Mochafe();
    fe.steps("My first step", function() {
      return 1;
    });

    it("adds steps to a catalog", function() {
      assert.lengthOf(fe.catalog, 1);
    });

    it("throws if a step is already defined", function() {
      assert.throws(function() {
        fe.steps("My first step", function() {
          return 1;
        });
      }, "Step: `My first step` is already defined.");
    });
  });

  describe("#reset", function() {
    it("clears existing steps", function() {
      var fe = new Mochafe();
      fe.steps("A step", function() {});
      fe.reset();
      assert.lengthOf(Object.keys(fe.catalog), 0);
    });
  });

  describe("#step", function() {
    var fe = new Mochafe();
    afterEach(function() {
      fe.reset();
    });

    it("executes the step", function() {
      fe.steps("I throw when called", function() {
        throw new Error("Boom!");
      });

      assert.throws(function() {
        fe.step("I throw when called");
      }, "Boom!");
    });

    it("throws if the step is not found", function() {
      assert.throws(function() {
        fe.step("I don't exist");
      }, "Step: `I don't exist` is not a defined step.");
    });

    it("can pass in arguments", function() {
      fe.steps("assert 1 equals 1", function(val) {
        assert.equal(val, 1);
      });

      fe.step("assert 1 equals 1", 1);
    });

    it("handles steps in sequence", function() {
      var seq = 0;
      fe.steps("this happens first", function() {
        seq = 1;
      });

      fe.steps("then this happens", function() {
        assert.equal(seq, 1);
      });

      fe.step("this happens first");
      fe.step("then this happens");
      assert(!fe.running);
    });

    it("handles aysnc steps", function(done) {
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

      fe.step("will takes some time", "A", "B", "C");
      fe.step("has taken at least about a second");
      fe.step(function() {
        assert(!fe.running);
        done();
      });
    });
  });

  it("can be passed steps to loaded during initialization", function() {
    var globalSteps = {
      "a global step": function(a, b) {
        assert.equal(a, b);
      },
      "and another": function() {
        throw new Error("Boom!");
      }
    };

    var fe = new Mochafe({
      steps: [
        globalSteps
      ]
    });

    fe.steps("local step", function(a, b) {
      assert(a > b);
    });

    fe.step("a global step", 1, 1);
    assert.throws(function() {
      fe.step("and another");
    }, "Boom!");
    fe.step("local step", 2, 1);
  });
});
