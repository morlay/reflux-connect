import Reflux from 'reflux';

export default function refluxConnectMixins(stateKeyMap = {}) {
  return Object.keys(stateKeyMap).map((stateKey)=> {
    return Reflux.connect(stateKeyMap[stateKey], stateKey);
  });
}