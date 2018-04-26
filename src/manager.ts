import { IIdentity } from './identity';

export interface IIdentityProvider {
  getIdentity(): Promise<IIdentity>;
  update(identity: string, credentials: object, store?: boolean): Promise<IIdentity>;
  clear(): Promise<void>;
}

export interface IIdentityManager {
  forService(serviceName: string): IIdentityProvider;
  addProvider(serviceName: string, provider: IIdentityProvider): this;
  refreshAll(): Promise<IIdentity[]>;
  logout(): Promise<void>;
}

export default class IdentityManager implements IIdentityManager {
  private providers = new Map<string, IIdentityProvider>();

  forService(serviceName: string) {
    return this.providers.get(serviceName)!;
  }

  addProvider(serviceName: string, provider: IIdentityProvider) {
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
