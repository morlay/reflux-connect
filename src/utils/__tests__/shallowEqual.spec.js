import { expect } from 'chai';
import shallowEqual from '../shallowEqual';

describe('shallowEqual', () => {
  it('should return true if arguments fields are equal', () => {
    expect(
      shallowEqual(
        {a: 1, b: 2, c: undefined},
        {a: 1, b: 2, c: undefined}
      )
    ).to.be.eql(true);

    expect(
      shallowEqual(
        {a: 1, b: 2, c: 3},
        {a: 1, b: 2, c: 3}
      )
    ).to.be.eql(true);

    const o = {};
    expect(
      shallowEqual(
        {a: 1, b: 2, c: o},
        {a: 1, b: 2, c: o}
      )
    ).to.be.eql(true);
  });

  it('should return false if first argument has too many keys', () => {
    expect(
      shallowEqual(
        {a: 1, b: 2, c: 3},
        {a: 1, b: 2}
      )
    ).to.be.eql(false);
  });

  it('should return false if second argument has too many keys', () => {
    expect(
      shallowEqual(
        {a: 1, b: 2},
        {a: 1, b: 2, c: 3}
      )
    ).to.be.eql(false);
  });

  it('should return false if arguments have different keys', () => {
    expect(
      shallowEqual(
        {a: 1, b: 2, c: undefined},
        {a: 1, bb: 2, c: undefined}
      )
    ).to.be.eql(false);
  });
});