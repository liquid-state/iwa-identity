import { KeyValueStore, Key } from '@liquid-state/iwa-keyvalue';

export interface ISerialisableIdentity {
  identity: string | null;
  credentials: object | null;
}

export interface IIdentityStore {
  store(service: string, identity: ISerialisableIdentity): Promise<void>;
  fetch(service: string): Promise<ISerialisableIdentity>;
}

export interface IIdentityStoreDelegate {
  setPermissionsForKey(key: Key): void;
}

export default class IdentityStore implements IIdentityStore {
  private readonly BASE_KEY = 'identity';

  constructor(private keyValueStore: KeyValueStore, private delegate: IIdentityStoreDelegate) {}

  store(service: string, identity: ISerialisableIdentity): Promise<void> {
    let keyName = `${this.BASE_KEY}.${service}`;
    let key = new Key(keyName, identity);
    this.delegate.setPermissionsForKey(key);
    return this.keyValueStore.set(key);
  }

  async fetch(service: string): Promise<ISerialisableIdentity> {
    let keyName = `${this.BASE_KEY}.${service}`;
    let key = await this.keyValueStore.get(keyName);
    if (!key.value) {
      return { identity: null, credentials: null };
    }
    return key.decodeValue() as ISerialisableIdentity;
  }
}
