import React from 'react';
import hoistStatics from 'hoist-non-react-statics';
import invariant from 'invariant';

import refluxConnectMixins from './utils/refluxConnectMixins';
import isPlainObject from './utils/isPlainObject';
import shallowEqual from './utils/shallowEqual';

const defaultMapStateToProps = (state) => state || {};

const defaultMapActionsToProps = () => ({});

const defaultMergeProps = (stateProps, actionsProps, parentProps) => ({
  ...parentProps,
  ...stateProps,
  ...actionsProps,
});

const wrapActionCreators = (actionsMap) => () => actionsMap;

export default function refluxConnect(stateMap = {}) {
  const connectMixins = refluxConnectMixins(stateMap);

  return function connect(mapStateToProps, mapActionsToProps, mergeProps, options = {}) {
    const finalMapStateToProps = mapStateToProps || defaultMapStateToProps;
    const finalMapActionsToProps = (
        isPlainObject(mapActionsToProps) ?
          wrapActionCreators(mapActionsToProps) :
          mapActionsToProps
      ) || defaultMapActionsToProps;
    const finalMergeProps = mergeProps || defaultMergeProps;

    const { pure = true, withRef = false } = options;

    function computeStateProps(state, props) {
      const stateProps = finalMapStateToProps(state, props);

      invariant(
        isPlainObject(stateProps),
        '`mapStateToProps` must return an object. Instead received %s.',
        stateProps
      );

      return stateProps;
    }

    function computeActionsProps(state, props) {
      const actionsProps = finalMapActionsToProps(state, props);

      invariant(
        isPlainObject(actionsProps),
        '`mapActionsToProps` must return an object. Instead received %s.',
        actionsProps
      );

      return actionsProps;
    }

    function computeNextState(stateProps, actionsProps, parentProps) {
      const mergedProps = finalMergeProps(stateProps, actionsProps, parentProps);

      invariant(
        isPlainObject(mergedProps),
        '`mergeProps` must return an object. Instead received %s.',
        mergedProps
      );

      return mergedProps;
    }

    return function wrapWithConnect(WrappedComponent) {
      const Connect = React.createClass({

        mixins: connectMixins,

        componentWillMount() {
          this.stateProps = computeStateProps(this.state, this.props);
          this.actionsProps = computeActionsProps(this.state, this.props);
          this.updateState(this.props);
        },

        shouldComponentUpdate(nextProps, nextState) {
          if (!pure) {
            this.updateStateProps(nextState, nextProps);
            this.updateActionsProps(nextState, nextProps);
            this.updateState(nextProps);
            return true;
          }

          const stateChanged = nextState !== this.state;
          const propsChanged = !shallowEqual(nextProps, this.props);

          let mapStateProducedChange = false;
          let actionsPropsChanged = false;

          if (stateChanged || propsChanged) {
            mapStateProducedChange = this.updateStateProps(nextState, nextProps);
            actionsPropsChanged = this.updateActionsProps(nextState, nextProps);
          }

          if (propsChanged || mapStateProducedChange || actionsPropsChanged) {
            this.updateState(nextProps);
            return true;
          }

          return false;
        },

        getWrappedInstance() {
          invariant(withRef,
            `
            To access the wrapped instance, you need to specify
            { withRef: true } as the fourth argument of the connect() call.
            `
          );

          return this.refs.wrappedInstance;
        },

        updateStateProps(state, props) {
          const nextStateProps = computeStateProps(state, props);
          if (shallowEqual(nextStateProps, this.stateProps)) {
            return false;
          }
          this.stateProps = nextStateProps;
          return true;
        },

        updateActionsProps(state, props) {
          const nextActionsProps = computeActionsProps(state, props);
          if (shallowEqual(nextActionsProps, this.actionsProps)) {
            return false;
          }
          this.actionsProps = nextActionsProps;
          return true;
        },

        updateState(props) {
          this.nextState = this.computeNextState(props);
        },

        computeNextState(props) {
          return computeNextState(
            this.stateProps,
            this.actionsProps,
            props
          );
        },

        render() {
          const ref = withRef ? 'wrappedInstance' : null;
          return (
            <WrappedComponent {...this.nextState} ref={ref} />
          );
        },
      });

      Connect.WrappedComponent = WrappedComponent;

      return hoistStatics(Connect, WrappedComponent);
    };
  };
}
