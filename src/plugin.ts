import { App } from '@liquid-state/iwa-core';
import IdentityManager, { IIdentityManager } from './manager';

export default class IdentityPlugin {
  static key = 'identity';

  static configure() {
    return new IdentityPlugin();
  }

  public key = IdentityPlugin.key;
  private manager: IIdentityManager | undefined;

  // Prevent newing outside of the class definition. Should be constructed with configure.
  private constructor() {}

  use(app: App) {
    if (!this.manager) {
      this.manager = new IdentityManager();
    }
    return this.manager;
  }
}
