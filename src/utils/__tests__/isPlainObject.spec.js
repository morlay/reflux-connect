import { expect } from 'chai';
import isPlainObject from '../isPlainObject';

describe('isPlainObject', () => {
  it('should return true only if plain object', () => {
    function Test() {
      this.prop = 1;
    }

    expect(isPlainObject(new Test())).to.be.eql(false);
    expect(isPlainObject(new Date())).to.be.eql(false);
    expect(isPlainObject([1, 2, 3])).to.be.eql(false);
    expect(isPlainObject(null)).to.be.eql(false);
    expect(isPlainObject()).to.be.eql(false);
    expect(isPlainObject({'x': 1, 'y': 2})).to.be.eql(true);
  });
});
