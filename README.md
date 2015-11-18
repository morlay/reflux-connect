## Reflux connect

[Higher order Components](http://jamesknelson.com/structuring-react-applications-higher-order-components/) creator for [Reflux](https://github.com/reflux/refluxjs)

[![Build Status](https://img.shields.io/travis/morlay/reflux-connect.svg?style=flat-square)](https://travis-ci.org/morlay/reflux-connect)
[![Coverage](https://img.shields.io/coveralls/morlay/reflux-connect.svg?style=flat-square)](https://coveralls.io/r/morlay/reflux-connect)
[![NPM](https://img.shields.io/npm/v/reflux-connect.svg?style=flat-square)](https://npmjs.org/package/reflux-connect)
[![Dependencies](https://img.shields.io/david/morlay/reflux-connect.svg?style=flat-square)](https://david-dm.org/morlay/reflux-connect)
[![License](https://img.shields.io/npm/l/reflux-connect.svg?style=flat-square)](https://npmjs.org/package/reflux-connect)

### Usages

#### Actions & Stores

Only support the `Reflux.connect` way, actions will be the same, but stores should be use as reflux.connect,
see more <https://github.com/reflux/refluxjs#using-refluxconnect>

#### Components

```js
import React from 'react';
import refluxConnect from 'reflux-connect';

import storeA from '../stores/storeA';
import storeB from '../stores/storeB';
import commonActions from '../actions/commonActions';

const componentConnect = refluxConnect({
  storeA: storeA,
  storeB: storeB   
})((state) => {
  return {
    storeA: state.storeA,
    storeB: state.storeB   
  }
}, {
  fetchData: commonActions.fetchData
});

class Component extends React.Component {
  static propTypes = {
    storeA: React.PropTypes.object
    storeB: React.PropTypes.object
    fetchData: React.PropTypes.func.isRequired
  }
  
  render() {
    return null;
  }
}

export default componentConnect(Component)

```

#### `refluxConnect` Details
 
`refluxConnect(stateKeyMap)([mapStateToProps], [mapActionsToProps], [mergeProps], [options])`

same design as <https://github.com/rackt/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options>

Connects a React component to reflux stores and actions.

It does not modify the component class passed to it.
Instead, it returns a new, connected component class, for you to use.

However, we should create a stateKeyMap for the connect state.
Once we created the stateKeyMap, the Component will be subscribed to the related stores.

##### Arguments:

`[mapStateToProps(state, [ownProps]): stateProps] (Function)`: 
If specified, the component will subscribe to reflux stores updates. 
Any time it updates, mapStateToProps will be called. 
Its result must be a plain object, and it will be merged into the component’s props. 
If ownProps is specified as a second argument, its value will be the properties passed to your component, 
and mapStateToProps will be re-invoked whenever the component receives new props.
If you omit it, will return the created state object.

`[mapActionsToProps(state, [ownProps]): actionProps]` (Object or Function): 
If an object is passed, each function inside it will be assumed to be an action creator. 
An object with the same function names, will be merged into the component’s props. 
If a function is passed, it will be given dispatch.
 It’s up to you to return an object that somehow uses dispatch to bind action creators in your own way. 
If you omit it, will return empty object.

`[mergeProps(stateProps, actionProps, ownProps): props] (Function)`: 
If specified, it is passed the result of mapStateToProps(), mapActionsToProps(), and the parent props. 
The plain object you return from it will be passed as props to the wrapped component. 
You may specify this function to select a slice of the state based on props, 
or to bind action creators to a particular variable from props. 
If you omit it, `Object.assign({}, ownProps, stateProps, actionProps)` is used by default.

`[options] (Object)` If specified, further customizes the behavior of the connector.

`[pure = true] (Boolean)`: 
If true, implements shouldComponentUpdate and shallowly compares the result of mergeProps, 
preventing unnecessary updates, 
assuming that the component is a “pure” component and does not rely on any input or state other than its props and the selected store’s state. 
Defaults to true.

`[withRef = false] (Boolean)`: If true, stores a ref to the wrapped component instance and makes it available via getWrappedInstance() method. Defaults to false.


##### Returns

**Static Properties**

* `WrappedComponent` (Component): The original component class passed to `connect()`.

**Static Methods**

All the original static methods of the component are hoisted.

**Instance Methods**

`getWrappedInstance(): ReactComponent`

Returns the wrapped component instance. Only available if you pass `{ withRef: true }` as part of the `connect()`’s fourth options argument.

