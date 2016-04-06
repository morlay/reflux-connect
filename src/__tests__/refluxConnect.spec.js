import { expect } from 'chai';
import jsdom from 'mocha-jsdom';
import sinon from 'sinon';

import React from 'react';
import ReactTestUtils from 'react/lib/ReactTestUtils';
import Reflux from 'reflux';
import refluxConnect from '../refluxConnect';

class MockedComponent extends React.Component {
  static staticKey = 'staticKey';
  renderCheck = sinon.spy();

  render() {
    this.renderCheck();
    return <div {...this.props} />;
  }
}

describe('refluxConnect', () => {
  jsdom();

  context('static props', () => {
    it('should bind to connected component, connect and render without error', () => {
      const ConnectedComponent = refluxConnect()()(MockedComponent);

      expect(ConnectedComponent.staticKey).to.eql(MockedComponent.staticKey);

      const connectedComponent = ReactTestUtils.renderIntoDocument(<ConnectedComponent someKey />);

      expect(ReactTestUtils.findRenderedComponentWithType(connectedComponent, MockedComponent).props).to.eql({
        someKey: true,
      });
    });
  });

  context('empty state map', () => {
    it('should connect and render without error', () => {
      const ConnectedComponent = refluxConnect()(null, null, null, {
        withRef: true,
      })(MockedComponent);

      const connectedComponent = ReactTestUtils.renderIntoDocument(<ConnectedComponent someKey />);

      expect(connectedComponent.getWrappedInstance().props).to.eql({
        someKey: true,
      });
    });
  });

  context('connect with mapStateToProps', () => {
    let commonStore;

    beforeEach(() => {
      commonStore = Reflux.createStore({
        getInitialState() {
          return {
            storeKey: 'defaultKey',
          };
        },
      });
    });

    it('should connect store and assign to props of wrapped Component with registered state', () => {
      const localStore = Reflux.createStore({
        getInitialState() {
          return {
            localStoreKey: 'defaultKey',
          };
        },
      });

      const ConnectedComponent = refluxConnect({
        fromStore: commonStore,
        localStore,
      })(null, null, null, {
        withRef: true,
      })(MockedComponent);

      const connectedComponent = ReactTestUtils.renderIntoDocument(<ConnectedComponent />);

      expect(connectedComponent.getWrappedInstance().props).to.eql({
        fromStore: {
          storeKey: 'defaultKey',
        },
        localStore: {
          localStoreKey: 'defaultKey',
        },
      });
    });

    it('should update the props of wrapped Component, when store update', () => {
      const ConnectedComponent = refluxConnect({
        fromStore: commonStore,
      })(null, null, null, {
        withRef: true,
      })(MockedComponent);

      const connectedComponent = ReactTestUtils.renderIntoDocument(<ConnectedComponent />);

      commonStore.trigger({
        storeKey: 'updatedKey',
      });

      expect(connectedComponent.getWrappedInstance().props).to.eql({
        fromStore: {
          storeKey: 'updatedKey',
        },
      });
    });

    it('stateProps should be assigned to the props of wrapped Component', () => {
      const mapStateToProps = (state) => ({
        storeKey: state.fromStore.storeKey,
      });

      const ConnectedComponent = refluxConnect({
        fromStore: commonStore,
      })(mapStateToProps, null, null, {
        withRef: true,
      })(MockedComponent);

      const connectedComponent = ReactTestUtils.renderIntoDocument(<ConnectedComponent />);

      expect(connectedComponent.getWrappedInstance().props).to.eql({
        storeKey: 'defaultKey',
      });
    });

    it('when store changes, should update the props of wrapped Component', () => {
      const mapStateToProps = (state) => ({
        storeKey: state.fromStore.storeKey,
      });

      const ConnectedComponent = refluxConnect({
        fromStore: commonStore,
      })(mapStateToProps, null, null, {
        withRef: true,
      })(MockedComponent);

      const connectedComponent = ReactTestUtils.renderIntoDocument(<ConnectedComponent />);

      commonStore.trigger({
        storeKey: 'updatedKey',
      });

      expect(connectedComponent.getWrappedInstance().props).to.eql({
        storeKey: 'updatedKey',
      });
    });

    it('when multi updates, if stateProps is not change, will not render again', () => {
      const mapStateToProps = (state) => ({
        storeKey: state.fromStore.storeKey,
      });

      const ConnectedComponent = refluxConnect({
        fromStore: commonStore,
      })(mapStateToProps, null, null, {
        withRef: true,
      })(MockedComponent);

      const connectedComponent = ReactTestUtils.renderIntoDocument(<ConnectedComponent />);
      expect(connectedComponent.getWrappedInstance().renderCheck.callCount).to.eql(1);

      commonStore.trigger({
        storeKey: 'updatedKey',
      });

      expect(connectedComponent.getWrappedInstance().renderCheck.callCount).to.eql(2);
      expect(connectedComponent.getWrappedInstance().props).to.eql({
        storeKey: 'updatedKey',
      });

      commonStore.trigger({
        storeKey: 'updatedKey',
      });

      expect(connectedComponent.getWrappedInstance().renderCheck.callCount).to.eql(2);
      expect(connectedComponent.getWrappedInstance().props).to.eql({
        storeKey: 'updatedKey',
      });
    });

    it('when multi updates, but not pure render, if stateProps is not change, will render again', () => {
      const mapStateToProps = (state) => ({
        storeKey: state.fromStore.storeKey,
      });

      const ConnectedComponent = refluxConnect({
        fromStore: commonStore,
      })(mapStateToProps, null, null, {
        pure: false,
        withRef: true,
      })(MockedComponent);

      const connectedComponent = ReactTestUtils.renderIntoDocument(<ConnectedComponent />);
      expect(connectedComponent.getWrappedInstance().renderCheck.callCount).to.eql(1);

      commonStore.trigger({
        storeKey: 'updatedKey',
      });

      expect(connectedComponent.getWrappedInstance().renderCheck.callCount).to.eql(2);
      expect(connectedComponent.getWrappedInstance().props).to.eql({
        storeKey: 'updatedKey',
      });

      commonStore.trigger({
        storeKey: 'updatedKey',
      });

      expect(connectedComponent.getWrappedInstance().renderCheck.callCount).to.eql(3);
      expect(connectedComponent.getWrappedInstance().props).to.eql({
        storeKey: 'updatedKey',
      });
    });

    it('should update the props of wrapped Component, when props changed', () => {
      const mapStateToProps = (state, props) => {
        if (props.customProp === 'updatedProp') {
          return {
            storeKey: props.customProp,
          };
        }
        return {
          storeKey: state.fromStore.storeKey,
        };
      };

      const ConnectedComponent = refluxConnect({
        fromStore: commonStore,
      })(mapStateToProps, null, null, {
        withRef: true,
      })(MockedComponent);


      class Test extends React.Component {

        constructor(props) {
          super(props);
          this.state = {};
          this.state.customProp = 'defaultProp';
        }

        render() {
          return (
            <ConnectedComponent
              ref='connectedComponent'
              customProp={this.state.customProp}
            />
          );
        }
      }

      const test = ReactTestUtils.renderIntoDocument(<Test />);

      expect(test.refs.connectedComponent.getWrappedInstance().props).to.eql({
        storeKey: 'defaultKey',
        customProp: 'defaultProp',
      });

      test.setState({
        customProp: 'updatedProp',
      });

      expect(test.refs.connectedComponent.getWrappedInstance().props).to.eql({
        storeKey: 'updatedProp',
        customProp: 'updatedProp',
      });
    });
  });

  context('connect with mapActionsToProps', () => {
    let commonStore;
    let commonActions;

    beforeEach(() => {
      commonActions = {
        someAction: Reflux.createAction(),
      };

      commonStore = Reflux.createStore({
        init() {
          this.listenTo(commonActions.someAction, '_onSomeAction');
        },

        _onSomeAction() {
          this.trigger({
            storeKey: 'updatedKey',
          });
        },

        getInitialState() {
          return {
            storeKey: 'defaultKey',
          };
        },
      });
    });

    it('actions should assign to the props of wrapped component', () => {
      const ConnectedComponent = refluxConnect({
        fromStore: commonStore,
      })(null, {
        someAction: commonActions.someAction,
      }, null, {
        withRef: true,
      })(MockedComponent);

      const connectedComponent = ReactTestUtils.renderIntoDocument(<ConnectedComponent />);

      expect(connectedComponent.getWrappedInstance().props).to.eql({
        fromStore: {
          storeKey: 'defaultKey',
        },
        someAction: commonActions.someAction,
      });
    });

    it('when actionProps called should trigger reflux flow', (done) => {
      const ConnectedComponent = refluxConnect({
        fromStore: commonStore,
      })(null, {
        someAction: commonActions.someAction,
      }, null, {
        withRef: true,
      })(MockedComponent);

      const connectedComponent = ReactTestUtils.renderIntoDocument(<ConnectedComponent />);

      expect(connectedComponent.getWrappedInstance().props).to.eql({
        fromStore: {
          storeKey: 'defaultKey',
        },
        someAction: commonActions.someAction,
      });

      connectedComponent.getWrappedInstance().props.someAction();

      // reflux flow have some delay when state update
      setTimeout(() => {
        expect(connectedComponent.getWrappedInstance().props).to.eql({
          fromStore: {
            storeKey: 'updatedKey',
          },
          someAction: commonActions.someAction,
        });
        done();
      });
    });

    it('when multi updates, if actionsProps is not change, will not render again', () => {
      const someMockAction = () => null;

      const ConnectedComponent = refluxConnect({
        fromStore: commonStore,
      })(null, (state, props) => {
        if (props.customProp === 'updatedKey') {
          return {
            someAction: someMockAction,
          };
        }
        return {
          someAction: commonActions.someAction,
        };
      }, null, {
        withRef: true,
      })(MockedComponent);


      class Test extends React.Component {

        constructor(props) {
          super(props);
          this.state = {};
          this.state.customProp = 'defaultProp';
        }

        render() {
          return (
            <ConnectedComponent
              ref='connectedComponent'
              customProp={this.state.customProp}
            />
          );
        }
      }

      const test = ReactTestUtils.renderIntoDocument(<Test />);
      expect(test.refs.connectedComponent.getWrappedInstance().renderCheck.callCount).to.eql(1);

      test.setState({
        customProp: 'updatedKey',
      });

      expect(test.refs.connectedComponent.getWrappedInstance().renderCheck.callCount).to.eql(2);
      expect(test.refs.connectedComponent.getWrappedInstance().props).to.eql({
        customProp: 'updatedKey',
        fromStore: {
          storeKey: 'defaultKey',
        },
        someAction: someMockAction,
      });

      test.setState({
        customProp: 'updatedKey',
      });

      expect(test.refs.connectedComponent.getWrappedInstance().renderCheck.callCount).to.eql(2);
      expect(test.refs.connectedComponent.getWrappedInstance().props).to.eql({
        customProp: 'updatedKey',
        fromStore: {
          storeKey: 'defaultKey',
        },
        someAction: someMockAction,
      });
    });

    it('when actionProps called should not trigger reflux flow when disabled', (done) => {
      const ConnectedComponent = refluxConnect({
        fromStore: commonStore,
      })(null, (state, props) => {
        if (props.disabled) {
          return {
            someAction: () => null,
          };
        }
        return {
          someAction: commonActions.someAction,
        };
      }, null, {
        withRef: true,
      })(MockedComponent);

      const connectedComponent = ReactTestUtils.renderIntoDocument(<ConnectedComponent disabled />);

      expect(connectedComponent.getWrappedInstance().props.fromStore).to.eql({
        storeKey: 'defaultKey',
      });

      connectedComponent.getWrappedInstance().props.someAction();

      // reflux flow have some delay when state update
      setTimeout(() => {
        expect(connectedComponent.getWrappedInstance().props.fromStore).to.eql({
          storeKey: 'defaultKey',
        });
        done();
      });
    });
  });

  context('connect with mergeProps', () => {
    let commonStore;

    beforeEach(() => {
      commonStore = Reflux.createStore({
        getInitialState() {
          return {
            storeKey: 'defaultKey',
          };
        },
      });
    });

    it('should custom merge rules with mergeProps', () => {
      const ConnectedComponent = refluxConnect({
        fromStore: commonStore,
      })(null, null, (stateProps, actionsProps, ownProps) => ({
        storeKey: stateProps.fromStore.storeKey,
        someKey: ownProps.someKey ? 'someKey' : '',
      }), {
        withRef: true,
      })(MockedComponent);

      const connectedComponent = ReactTestUtils.renderIntoDocument(<ConnectedComponent someKey />);

      expect(connectedComponent.getWrappedInstance().props).to.eql({
        storeKey: 'defaultKey',
        someKey: 'someKey',
      });
    });
  });
});
