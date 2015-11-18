import { expect } from 'chai';
import jsdom from 'mocha-jsdom';

import React from 'react';
import ReactTestUtils from 'react/lib/ReactTestUtils';
import Reflux from 'reflux';
import refluxConnectMixins from '../refluxConnectMixins';

describe('refluxConnectMixins', () => {
  jsdom();

  it('simple store should generate connect mixins from mapObject', () => {
    const valueStore = Reflux.createStore({
      getInitialState() {
        return 1;
      }
    });

    const generatedMixins = refluxConnectMixins({
      value: valueStore
    });

    const Component = React.createClass({
      mixins: generatedMixins,
      render() {
        return null;
      }
    });

    const component = ReactTestUtils.renderIntoDocument(<Component/>);

    expect(component.state)
      .to.eql({
        value: 1
      });
  });


  it('multi store should generate connect mixins from mapObject', () => {
    const valueStore = Reflux.createStore({
      getInitialState() {
        return 1;
      }
    });

    const objectStore = Reflux.createStore({
      getInitialState() {
        return {
          a: 1,
          b: 2
        };
      }
    });

    const generatedMixins = refluxConnectMixins({
      value: valueStore,
      object: objectStore
    });

    const Component = React.createClass({
      mixins: generatedMixins,
      render() {
        return null;
      }
    });

    const component = ReactTestUtils.renderIntoDocument(<Component/>);

    expect(component.state)
      .to.eql({
        value: 1,
        object: {
          a: 1,
          b: 2
        }
      });
  });
});