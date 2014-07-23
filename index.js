/* jshint node: true */

/*
 * expose
 */

module.exports = Mochafe;

/*
 * defaults
 */

Mochafe.prototype.catalog = [];
Mochafe.prototype.sprint = [];
Mochafe.prototype.running = false;

/*
 * mochafe
 *
 * @param {Object} opts
 * @constructor
 * @api public
 */

function Mochafe(opts) {
  this.reset();

  opts = opts || {};
  this.loadSteps(opts.steps);
  // TODO this.setContext(opts.context);
}

/*
 * loadSteps loads an array of steps objects
 *
 * @param {Array} stepsArr
 * @api public
 */

Mochafe.prototype.loadSteps = function(stepsArr) {
  if ("undefined" === typeof stepsArr) {
    return;
  }

  var i = 0;
  var len = stepsArr.length;
  var self = this;
  for(; i<len; i++) {
    var steps = stepsArr[i];
    importSteps.call(self, steps);
  }
};

/*
 * importSteps adds the steps to the mochafe instance, allowing them to through existance checks
 *
 * @param {Object} steps
 * @api private
 */

function importSteps(steps) {
  var keys = Object.keys(steps);
  var i = 0;
  var len = keys.length;
  var self = this;
  for(; i<len; i++) {
    var name = keys[i];
    var fn = steps[name];
    self.steps(name, fn);
  }
}

/*
 * reset clears the step catalog
 *
 * @api public
 */

Mochafe.prototype.reset = function() {
  this.catalog = [];
  this.sprint = [];
  this.running = false;
};


/*
 * steps stores functions by name to an key/value catalog
 *
 * @param {Bool} async
 * @param {String} name
 * @param {Function} fn
 * @return {Mochafe} for chaining
 * @api public
 */

Mochafe.prototype.steps = function(async, name, fn) {
  if (true !== async) {
    fn = name;
    name = async;
    async = false;
  }

  var step = findStep(name, this.catalog);
  if (step) {
    throw new StepDefinitionError("Step: `"+name+"` is already defined.");
  }

  this.catalog.push({
    async: async,
    name: name,
    fn: fn
  });

  return this;
};

/*
 * step executs stored functions
 *
 * @param {String} name
 * @api public
 */

Mochafe.prototype.step = function(name) {
  var test;

  if ("function" === typeof name) {
    test = name;
  } else {
    var step = findStep(name, this.catalog);
    var fn = step.fn;
    var async = step.async;
    var args = Array.prototype.slice.call(arguments, 1);
    test = testfn(fn, args, run.bind(this), async);
  }

  this.sprint.push(test);

  if (!this.running) {
    run.call(this);
  }
};

/*
 * testfn is factory to build test for execution and handle asyncness
 *
 * @param {Function} fn
 * @param {Array} args
 * @param {Function} run
 * @param {Bool} async
 * @return {Function}
 * @api private
 */

function testfn(fn, args, run, async) {
  return function() {
    if (async) {
      args.push(run);
    }

    fn.apply(null, args);

    if (!async) {
      run();
    }
  };
}

/*
 * run runs through the queued tests functions 
 *
 * @api private
 */

function run() {
  if (this.sprint.length > 0) {
    this.running = true;
    var fn = this.sprint.shift();
    return fn();
  }

  this.running = false;
}

/*
 * findStep finds the step by name within the haystack
 *
 * @param {String} name
 * @param {Array} steps
 * @return {Object|false}
 * @api private
 */

function findStep(name, steps) {
  var i = 0;
  var len = steps.length;
  for (; i<len; i++) {
    step = steps[i];
    if (name === step.name) {
      return step;
    }
  }
  return false;
}

/*
 * StepDefinitionError
 *
 * @param {String} msg
 * @constructor
 * @api private
 */

function StepDefinitionError(msg) {
  Error.captureStackTrace(this);
  this.message = msg;
  this.name = "StepDefinitionError";
}

StepDefinitionError.prototype = Object.create(Error.prototype);

