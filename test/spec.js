'use strict'

var expect = require('chai').expect;

let wait;
try{
  wait = require('../test-cov/wait-promise');
}catch(ex){
  wait = require('../src/wait-promise');
}

describe('wait-promise', function(){
  describe('normal cases', function(){
    this.timeout(5000);

    it('wait object', function(){
      expect(wait).to.be.a('object');
    });

    it('wait check', function(){
      let i = 0;
      let p = wait.check(function(){
        expect(i).to.equal(1);
      });
      i++;
      return p;
    });

    it('wait after', function(){
      let i = 0;
      setTimeout(function(){
        i++;
      }, 100);
      expect(i).to.equal(0);
      return wait.after(300).check(function(){
        expect(i).to.equal(1);
      });
    });

    it('wait until', function(){
      let i = 0;
      let timer = setInterval(function(){
        i++;
      }, 50);
      let p = wait.until(function(){
        expect(i).to.be.above(10);
      });
      return p.then(function(){
        clearInterval(timer);
        expect(i).to.be.above(10);
      });
    });

    it('wait till', function(){
      let i = 0;
      let timer = setInterval(function(){
        i++;
      }, 50);
      return wait.till(function(){
        return i > 10;
      }).then(function(){
        expect(i).to.be.above(10);
      });
    });

    it('wait till throws error', function(){
      let i = 0;

      return wait.till(function(){
        expect(i).to.equal(1);
      }).catch(function(err){
        expect(err.message).to.be.a('string');
        expect(i).to.equal(0);
      });
    });

    it('wait before until', function(){
      let i = 0;
      let timer = setInterval(function(){
        i++;
      }, 50);
      let p = wait.before(200).until(function(){
        return i >= 10;
      });    
      return p.catch(function(){
        clearInterval(timer);
        expect(i).to.be.below(10);
      });        
    });

    it('wait after until', function(){
      let i = 0, j = 0;
      let timer = setInterval(function(){
        i++;
      }, 50);
      return wait.after(600).until(function(){
        return j++ > 5;
      }).then(function(){
        clearInterval(timer);
        expect(j).to.above(5);
        expect(i).to.above(15);
      });      
    });

    it('wait every until', function(){
      let i = 0;
      let timer = setInterval(function(){
        i++;
      }, 10);
      return wait.every(500).until(function(){
        return i > 10;
      }).then(function(){
        clearInterval(timer);
        expect(i).to.above(30);
      });
    });

    it('wait limit until', function(){
      let i = 0;
      let p = wait.limit(10).until(function(){
        i++;
        return false;
      });
      return p.catch(function(){
        expect(i).to.equal(10);
      });
    });

    it('wait limit till', function(){
      let i = 0;
      let p = wait.limit(10).till(function(){
        return ++i >= 20;
      });
      return p.catch(function(){
        expect(i).to.equal(10);
      });      
    });

    it('wait every with limit', function(){
      let i = 0;
      let p = wait.every(1, 10).till(function(){
        return ++i >= 20;
      });
      return p.catch(function(){
        expect(i).to.equal(10);
      })
    });

    it('wait every limit', function(){
      let i = 0;
      let p = wait.every(1).limit(10).till(function(){
        return ++i >= 20;
      });
      return p.catch(function(){
        expect(i).to.equal(10);
      })
    });

    it('wait after check', function(){
      let i = 0, j = 0;
      let timer = setInterval(function(){
        i++;
      }, 50);
      return wait.after(600).check(function(){
        return i > 50;
      }).catch(function(){
        expect(i).to.above(10);
        expect(i).to.below(50);
      });
    });
  });

  describe('async cases', function(){
    this.timeout(5000);
    let {until, sleep, every, and, before, after} = wait;   
  
    it('await until', async function(){
      let i = 0;
      await until(() => ++i >= 5);
      expect(i).to.equal(5);

      i = 0;
      await every(10).until(() => ++i >= 50);
      expect(i).to.equal(50);
    });
    it('wait every routine until', async function(){
      let i = 0, j = 0;
      await and(() => j++).until(() => j >= 3);
      await every(50).and(() => i++).until(()=> i >= 5);
      expect(i + j).to.equal(8);
    });
    it('await sleep', async function(){
      let t = Date.now();
      await sleep(500);
      expect(Date.now() - t).to.be.above(480);
    });

    it('await before until', async function(){
      let i = 0;
      async function test(){
        await every(10).before(100).until(() => ++i > 20);
      }
      return test().catch((e) => {
        expect(e.message).to.equal('check failed');
      });
    });
  });
});