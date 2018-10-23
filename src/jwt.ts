import Identity from './identity';
import { IIdentityProvider } from './manager';
import { IIdentityStore, ISerialisableIdentity } from './store';

export type Seconds = number;

export interface JWTCredentials {
  jwt: string;
}

/** A simple identity provider for working with Json Web Tokens. */
export default class JWTProvider implements IIdentityProvider<JWTCredentials> {
  private identity: Identity<JWTCredentials> = new Identity(null, null);

  constructor(
    private serviceName: string,
    private store: IIdentityStore,
    private refreshCallback?: () => Promise<ISerialisableIdentity>,
    private refreshWindow: Seconds = 300
  ) {}

  async getIdentity() {
    // Try to get stored credentials, verifying that the cached identity has not changed.
    if (!this.identity.isAuthenticated) {
      const storedIdentity = await this.getStoredIdentity();
      this.identity = storedIdentity;
    }
    if (!this.identity.isAuthenticated) {
      await this.refreshIdentity();
      if (!this.identity.isAuthenticated) {
        // Empty identity
        return this.identity;
      }
    }
    if (this.isExpired()) {
      await this.refreshIdentity();
    }
    return this.identity;
  }

  async update(identity: string, credentials: object, store = true) {
    this.identity = new Identity(identity, credentials as JWTCredentials);
    if (store) {
      this.store.store(this.serviceName, { identity, credentials });
    }
    return this.identity;
  }

  async clear() {
    this.identity = new Identity(null, null);
    this.store.store(this.serviceName, { identity: null, credentials: null });
  }

  private async getStoredIdentity() {
    let { identity, credentials } = await this.store.fetch(this.serviceName);
    return new Identity(identity, credentials as JWTCredentials);
  }

  private async refreshIdentity() {
    if (!this.refreshCallback) {
      this.identity = new Identity(null, null);
      return;
    }
    const { identity, credentials } = await this.refreshCallback();
    if (!identity) {
      this.clear();
    }
    this.update(identity!, credentials!);
  }

  private isExpired() {
    // Get the body of the JWT.
    if (!this.identity.credentials) {
      return true;
    }
    const payload = this.identity.credentials.jwt.split('.')[1];
    // Which is base64 encoded.
    const parsed = JSON.parse(atob(payload));
    let expiredTime = Math.floor(Date.now() / 1000) + this.refreshWindow;
    return parsed.exp < expiredTime;
  }
}
