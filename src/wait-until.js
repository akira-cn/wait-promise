'use strict'

function Wait(interval, beforeTime, afterTime){
  interval && this.every(interval);
  beforeTime && this.before(beforeTime);
  afterTime && this.after(afterTime);
}

Wait.prototype = {
  before: function(time){
    this.startTime = Date.now();
    this.expires = this.startTime + time;
    return this;
  },
  after: function(time){
    this.afterTime = time;
    return this;
  },
  every: function(interval){
    this.interval = interval;
    return this;
  },
  check: function(cond){
    cond = cond || function(){};
    return this.before(0).until(cond);
  },
  until: function(cond){
    var interval = this.interval,
        afterTime = this.afterTime,
        self = this;

    var timer;

    return new Promise(function(resolve, reject){
      function f(){
        var err, res;
        try{
          res = cond();
        }catch(ex){
          err = ex;
        }finally{
          if(Date.now() >= self.expires){
            clearInterval(timer);
            if(err !== undefined || res === false){
              reject(err || new Error('time out'));
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

      if(afterTime){
        setTimeout(function(){
          if(!f()){
            timer = setInterval(f, interval);
          }
        }, afterTime);
      }else{
        timer = setInterval(f, interval);
      }
    });
  }
};

module.exports = {
  every: function(interval, time){
    return new Wait(interval, time);
  },
  before: function(time){
    return new Wait(100, time);
  },
  after: function(time){
    return new Wait(100, Infinity, time);
  },
  sleep: function(time){
    return new Wait(100, Infinity, time).check(); 
  },
  until: function(cond){
    return (new Wait(100, Infinity)).until(cond);
  }
};