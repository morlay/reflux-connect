import Reflux from 'reflux';

export default function refluxConnectMixins(stateKeyMap = {}) {
  return Object.keys(stateKeyMap)
    .map((stateKey) => Reflux.connect(stateKeyMap[stateKey], stateKey));
}
