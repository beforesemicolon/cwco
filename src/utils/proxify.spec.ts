import {proxify} from "./proxify";

describe('proxify', () => {
  describe('should ignore', () => {
    it('proxy', () => {
      const prx = new Proxy({}, {});

      expect(proxify('sample', prx)).toEqual(prx);
    });

    it('function', () => {
      const fn1 = () => null;
      const fn2 = function sample() {};

      expect(proxify('sample', fn1)).toEqual(fn1);
      expect(proxify('sample', fn2)).toEqual(fn2);
    });

    it('number', () => {
      expect(proxify('sample', 12)).toEqual(12);
      expect(proxify('sample', new Number('21'))).toEqual(new Number('21'));
    });

    it('string', () => {
      expect(proxify('sample', 'str')).toEqual('str');
      expect(proxify('sample', new String('str'))).toEqual(new String('str'));
    });

    it('boolean', () => {
      expect(proxify('sample', true)).toEqual(true);
      expect(proxify('sample', false)).toEqual(false);
      expect(proxify('sample', new Boolean('true'))).toEqual(new Boolean('true'));
    });

    it('bigint', () => {
      expect(proxify('sample', 1n)).toEqual(1n);
      expect(proxify('sample', BigInt('12'))).toEqual(12n);
    });
  });

  describe('Array', () => {
    const cb = jest.fn();
    let arr: any[] = [];
    let prx: any;

    beforeEach(() => {
      arr = [];
      prx = proxify('sample', arr, cb);
      cb.mockClear();
    })

    describe('should proxy Array and call change callback', () => {
      it('when changed index', () => {
        prx[0] = [10];

        expect(cb).toHaveBeenCalledWith("sample", [[10]]);

        cb.mockClear();

        prx[0][0] = 20;

        expect(cb).toHaveBeenCalledWith("sample", [[20]]);
      });

      it('when using push and pop', () => {
        prx.push(10);

        expect(cb).toHaveBeenCalledWith("sample", [10]);

        cb.mockClear();

        prx.pop();

        expect(cb).toHaveBeenCalledWith("sample", []);
      });

      it('when using shift and unshift', () => {
        prx.unshift(10);

        expect(cb).toHaveBeenCalledWith("sample", [10]);

        cb.mockClear();

        prx.shift();

        expect(cb).toHaveBeenCalledWith("sample", []);
      });

      it('when using splice', () => {
        prx.push(10);

        expect(prx).toEqual([10]);

        prx.splice(0, 1, 20);

        expect(cb).toHaveBeenCalledWith("sample", [20]);
      });

      it('when using sort and reverse', () => {
        prx.push(40, 5, 15);

        expect(prx).toEqual([40, 5, 15]);

        cb.mockClear();

        prx.sort();

        expect(prx).toEqual([15, 40, 5]);
        expect(cb).toHaveBeenCalledWith("sample", [15, 40, 5]);

        cb.mockClear();

        prx.reverse();

        expect(prx).toEqual([5, 40, 15]);
        expect(cb).toHaveBeenCalledWith("sample", [5, 40, 15]);
      });

      it('when using fill and copyWithin', () => {
        prx.push(40, 5, 15);

        cb.mockClear();

        prx.fill(10, 0, 3);

        expect(prx).toEqual([10, 10, 10]);
        expect(cb).toHaveBeenCalledWith("sample", [10, 10, 10]);

        cb.mockClear();

        prx.copyWithin(0, 1);

        expect(cb).toHaveBeenCalledWith("sample", [10, 10, 10]);
      });

      it('when changing nested array value', () => {
        prx.push(10, [20, 30]);
        cb.mockClear();

        prx[1][0] = 40;

        expect(cb).toHaveBeenCalledWith("sample", [10, [40, 30]]);
      });

      it('when removing item with delete operator', () => {
        prx.push(10)

        cb.mockClear();

        delete prx[0];

        expect(cb).toHaveBeenCalledWith("sample", [undefined]);
      });

      it('when defining property', () => {
        Object.defineProperty(prx, 0, {
          get: () => 20
        });

        expect(cb).toHaveBeenCalledTimes(1);
        expect(arr[0]).toEqual(20);
      });

      it('when item changed in a loop', () => {
        prx.push({ a: 10 }, { a: 20 }, { a: 30 });
        cb.mockClear();

        // todo: this part of the tests is failing because the symbol iterator func gets the object bound to it
        // the bound is needed for when converting object to a different type
        // further research is needed to understand why this is happening
        // for (let item of prx) {
        //   item.a += 1;
        // }

        // expect(cb).toHaveBeenCalledTimes(3);
        // expect(cb).toHaveBeenCalledWith("sample", [{"a": 11}, {"a": 21}, {"a": 31}]);
        //
        // cb.mockClear();

        prx.forEach((item: any, index: number) => {
          item.a += 1;
        });

        expect(cb).toHaveBeenCalledTimes(3);
        expect(cb).toHaveBeenCalledWith("sample", [{"a": 11}, {"a": 21}, {"a": 31}]);
      });

      it('when item changed with find method', () => {
        prx.push({ a: 10 }, { a: 20 }, { a: 30 });
        cb.mockClear();

        prx.find((x: any) => x.a === 10).a = 100;

        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("sample", [{"a": 100}, {"a": 20}, {"a": 30}]);
      });
    });

    describe('should allow for common array actions like', () => {
      it('spreading', () => {
        prx.push(10, 20, 30);

        expect([...prx]).toEqual([10, 20, 30]);
      });

      it('toString', () => {
        prx.push(10, 20, 30);
        cb.mockClear();

        expect(prx.toString()).toEqual('10,20,30');
        expect(prx.join(',')).toEqual('10,20,30');
        expect(`${prx}`).toEqual('10,20,30');
        expect(JSON.stringify(prx)).toEqual('[10,20,30]');

        expect(cb).not.toHaveBeenCalled();
      });

      it('loop', () => {
        prx.push({ a: 10 }, { a: 20 }, { a: 30 });
        cb.mockClear();

        for (let item of prx) {
          cb(item);
        }

        expect(cb).toHaveBeenCalledWith({ a: 10 });
        expect(cb).toHaveBeenCalledWith({ a: 20 });
        expect(cb).toHaveBeenCalledWith({ a: 30 });

        cb.mockClear();

        prx.forEach((item: any, index: number) => {
          cb(item);
        });

        expect(cb).toHaveBeenCalledWith({ a: 10 });
        expect(cb).toHaveBeenCalledWith({ a: 20 });
        expect(cb).toHaveBeenCalledWith({ a: 30 });
      });

    });
  });

  describe('Object', () => {
    const cb = jest.fn();
    let obj: {[key: string]: any} = {};
    let prx: any;

    beforeEach(() => {
      obj = {
        numb: 10,
        str: 'test',
        valid: true,
        deep: {sample: 'test'}
      };
      prx = proxify('sample', obj, cb);
      cb.mockClear();
    })

    describe('should proxy object literal and call change callback', () => {
      it('when direct under value is changed', () => {
        prx.numb = 20;

        expect(cb).toHaveBeenCalledWith("sample", expect.objectContaining({numb: 20}));

        cb.mockClear();

        prx.str = 'tested';

        expect(cb).toHaveBeenCalledWith("sample", expect.objectContaining({str: 'tested'}));

        cb.mockClear();

        prx.valid = false;

        expect(cb).toHaveBeenCalledWith("sample", expect.objectContaining({valid: false}));

        cb.mockClear();

        prx.deep = null;

        expect(cb).toHaveBeenCalledWith("sample", expect.objectContaining({deep: null}));
      });

      it('when deeply changed ', () => {
        prx.deep.sample = 'tested';

        expect(cb).toHaveBeenCalledWith("sample", expect.objectContaining({deep: {sample: "tested"}}));
      });

      it('when defining property', () => {
        Object.defineProperty(prx, 'new', {
          get: () => 3000
        });

        expect(cb).toHaveBeenCalledWith("sample", obj);
        expect(obj.new).toBe(3000);
      });

      it('when removing item with delete operator', () => {
        delete prx.numb;

        expect(cb).toHaveBeenCalledWith("sample", {deep: {sample: "test"}, str: "test", valid: true});
      });
    });

    describe('should allow for common object actions like', () => {
      it('spreading', () => {
        expect({...prx}).toEqual(obj);
      });

      it('toString', () => {
        expect(prx.toString()).toEqual('[object Object]');
        expect(`${prx}`).toEqual('[object Object]');
        expect(JSON.stringify(prx)).toEqual('{"numb":10,"str":"test","valid":true,"deep":{"sample":"test"}}');

        expect(cb).not.toHaveBeenCalled();
      });

      it('looping', () => {
        for (let prxKey in prx) {
          cb(prxKey);
        }

        expect(cb).toHaveBeenCalledWith('numb');
        expect(cb).toHaveBeenCalledWith('str');
        expect(cb).toHaveBeenCalledWith('valid');
        expect(cb).toHaveBeenCalledWith('deep');

        cb.mockClear();

        for (let item of Object.values(prx)) {
          cb(item);
        }

        expect(cb).toHaveBeenCalledWith(10);
        expect(cb).toHaveBeenCalledWith('test');
        expect(cb).toHaveBeenCalledWith(true);
        expect(cb).toHaveBeenCalledWith({sample: 'test'});
      });

      it('get own keys', () => {
        expect(Object.keys(prx)).toEqual(['numb', 'str', 'valid', 'deep']);
      });

      it('get own values', () => {
        expect(Object.values(prx)).toEqual([
          10,
          "test",
          true,
          {
            "sample": "test"
          }
        ]);
      });

    });
  });

  describe('Map', () => {
    const cb = jest.fn();
    let obj = new Map();
    let prx: any;

    beforeEach(() => {
      obj = new Map();
      prx = proxify('sample', obj, cb);
      cb.mockClear();
    })

    describe('should proxy Map and call change callback', () => {
      it('when new item is set and deleted', () => {
        prx.set('sample', 10);

        expect(cb).toHaveBeenCalledWith("sample", new Map([['sample', 10]]));

        cb.mockClear();

        prx.delete('sample');

        expect(cb).toHaveBeenCalledWith("sample", new Map());
      });

      it('when cleared', () => {
        prx.set('sample', 10);
        cb.mockClear();

        expect(obj).toEqual(new Map([['sample', 10]]))

        prx.clear();

        expect(cb).toHaveBeenCalledWith("sample", new Map());
      });

      it('when deeply changed', () => {
        prx.set('sample', {deep: 'test'});
        cb.mockClear();

        expect(obj).toEqual(new Map([['sample', {deep: 'test'}]]))

        prx.get('sample').deep = 'tested';

        expect(cb).toHaveBeenCalledWith("sample", new Map([['sample', {deep: 'tested'}]]));
      });

      it('when item changed in a loop', () => {
        prx.set('one', { a: 10 });
        prx.set('two', { a: 20 });
        prx.set('three', { a: 30 });
        cb.mockClear();

        prx.forEach((item: any, index: number) => {
          item.a += 1;
        });

        expect(cb).toHaveBeenCalledTimes(3);
        expect(cb).toHaveBeenCalledWith("sample", new Map([
            ['one', { a: 11 }],
            ['two', { a: 21 }],
            ['three', { a: 31 }]
        ]));

        cb.mockClear();
        for (let item of prx.values()) {
          item.a += 1;
        }

        expect(cb).toHaveBeenCalledTimes(3);
        expect(cb).toHaveBeenCalledWith("sample", new Map([
          ['one', { a: 12 }],
          ['two', { a: 22 }],
          ['three', { a: 32 }]
        ]));
      });
    })

    describe('should allow for common map actions like', () => {
      it('to array', () => {
        prx.set('sample', 10);
        cb.mockClear();

        expect(Array.from(prx)).toEqual([['sample', 10]]);
        expect(Array.from(prx.keys())).toEqual(['sample']);
        expect(Array.from(prx.values())).toEqual([10]);
        expect(Array.from(prx.entries())).toEqual([['sample', 10]]);

        expect(cb).not.toHaveBeenCalled();
      });
    })
  })

  describe('Set', () => {
    const cb = jest.fn();
    let obj = new Set();
    let prx: any;

    beforeEach(() => {
      obj = new Set();
      prx = proxify('sample', obj, cb);
      cb.mockClear();
    })

    describe('should proxy Set and call change callback', () => {
      it('when new item is added and deleted', () => {
        prx.add(10);

        expect(cb).toHaveBeenCalledWith("sample", new Set([10]));

        cb.mockClear();

        prx.delete(10);

        expect(cb).toHaveBeenCalledWith("sample", new Set());
      });

      it('when cleared', () => {
        prx.add(10);
        cb.mockClear();

        expect(obj).toEqual(new Set([10]))

        prx.clear();

        expect(cb).toHaveBeenCalledWith("sample", new Set());
      });
    })

    describe('should allow for common set actions like', () => {
      it('to array', () => {
        prx.add(10);
        cb.mockClear();

        expect(Array.from(prx)).toEqual([10]);
        expect(Array.from(prx.keys())).toEqual([10]);
        expect(Array.from(prx.values())).toEqual([10]);
        expect(Array.from(prx.entries())).toEqual([[10, 10]]);

        expect(cb).not.toHaveBeenCalled();
      });
    })
  })
})