'use strict'

function Wait(interval, beforeTime, afterTime, limit){
  this.every(interval, limit);
  this.before(beforeTime);
  this.after(afterTime | 0);
}

Wait.prototype = {
  before: function(time){
    this.startTime = Date.now();
    this.expires = this.startTime + time;
    return this;
  },
  and: function(func){
    this.routine = func;
    return this;
  },
  after: function(time){
    this.afterTime = time;
    return this;
  },
  every: function(interval, limit){
    this.interval = interval;
    if(limit != null) this.limit(limit);
    return this;
  },
  limit: function(limit){
    limit = limit > 0 ? limit : Infinity;
    this.limit = limit;
    return this;
  },
  check: function(cond){
    cond = cond || function(){};
    return this.before(0).until(cond);
  },
  forward: function(){
    var self = this;
    return this.until(function(){return false});
  },
  till: function(cond){
    var self = this;
    return this.until(function(){
      var res;
      try{
        res = cond();
        return res === true;
      }catch(ex){
        self.limit = 0; //force error
        throw ex;
      }
    });
  }, 
  until: function(cond){
    var interval = this.interval,
        afterTime = this.afterTime,
        routine = this.routine,
        self = this;

    var timer, called = 0;

    return new Promise(function(resolve, reject){
      function f(){
        var err, res;
        routine && routine(called);
        called++;

        try{
          res = cond();
        }catch(ex){
          err = ex;
        }finally{
          if(Date.now() >= self.expires || called >= self.limit){
            clearInterval(timer);
            if(err !== undefined || res === false){
              reject(err || new Error('check failed'));
            }else{
              resolve(res);
            }
            return true;
          }else if(err === undefined && res !== false){
            clearInterval(timer);
            resolve(res);
            return true;
          }
          return false;
        }
      }

      setTimeout(function(){
        if(!f()){
          timer = setInterval(f, interval);
        }
      }, afterTime);
    });
  }
};

module.exports = {
  every: function(interval, limit){
    return new Wait(interval, Infinity, 0, limit);
  },
  and: function(func){
    return new Wait(100, Infinity, 0).and(func);
  },
  limit: function(limit){
    return new Wait(100, Infinity, 0, limit);
  },
  before: function(time, limit){
    return new Wait(100, time, 0, limit);
  },
  after: function(time){
    return new Wait(100, Infinity, time);
  },
  sleep: function(time){
    return new Wait(100, Infinity, time).check(); 
  },
  until: function(cond){
    return (new Wait(100, Infinity)).until(cond);
  },
  forward: function(){
    return (new Wait(100, Infinity)).forward();
  },
  till: function(cond){
    return (new Wait(100, Infinity)).till(cond);
  },
  check: function(cond){
    return (new Wait(100, 0)).until(cond);
  }
};