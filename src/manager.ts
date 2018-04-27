import { IIdentity } from './identity';

export interface IIdentityProvider<T> {
  getIdentity(): Promise<IIdentity<T>>;
  update(identity: string, credentials: object, store?: boolean): Promise<IIdentity<T>>;
  clear(): Promise<void>;
}

export interface IIdentityManager {
  forService<T>(serviceName: string): IIdentityProvider<T>;
  addProvider<T>(serviceName: string, provider: IIdentityProvider<T>): this;
  refreshAll(): Promise<IIdentity<any>[]>;
  logout(): Promise<void>;
}

export default class IdentityManager implements IIdentityManager {
  private providers = new Map<string, IIdentityProvider<any>>();

  forService(serviceName: string) {
    return this.providers.get(serviceName)!;
  }

  addProvider<T>(serviceName: string, provider: IIdentityProvider<T>) {
    this.providers.set(serviceName, provider);
    return this;
  }

  async logout() {
    const providers = Array.from(this.providers.values());
    await Promise.all(providers.map(p => p.clear()));
  }

  async refreshAll() {
    const providers = Array.from(this.providers.values());
    return Promise.all(providers.map(p => p.getIdentity()));
  }
}
