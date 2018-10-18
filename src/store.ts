import { KeyValueStore, Key } from '@liquid-state/iwa-keyvalue';
import { Value } from '@liquid-state/iwa-keyvalue/dist/key';

export interface ISerialisableIdentity {
  identity: string | null;
  credentials: object | null;
}

export interface IIdentityStore<T extends Value = ISerialisableIdentity> {
  store(service: string, identity: T): void;
  fetch(service: string): Promise<T>;
}

export interface IIdentityStoreDelegate {
  setPermissionsForKey(key: Key): void;
}

export default class IdentityStore<T extends Value = ISerialisableIdentity>
  implements IIdentityStore<T> {
  private readonly BASE_KEY = 'identity';

  constructor(private keyValueStore: KeyValueStore, private delegate: IIdentityStoreDelegate) {}

  store(service: string, identity: T): void {
    let keyName = `${this.BASE_KEY}.${service}`;
    let key = new Key(keyName, identity);
    this.delegate.setPermissionsForKey(key);
    this.keyValueStore.set(key);
  }

  async fetch(service: string): Promise<T> {
    let keyName = `${this.BASE_KEY}.${service}`;
    let key = await this.keyValueStore.get(keyName);
    if (!key.value) {
      throw '';
    }
    return key.decodeValue() as T;
  }
}
