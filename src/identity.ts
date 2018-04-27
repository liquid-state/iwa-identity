export interface IIdentity<T> {
  name: string | null;
  credentials: T | null;
  identifiers: Map<string, string>;
  isAuthenticated: boolean;
}

/** Default identity implementation, this can be replaced by identity providers which need additional control */
export default class Identity<T> implements IIdentity<T> {
  /**
   * The name by which this user should be identified. This could be their actual username
   * or some other user identifier, it should be consistent within a service but cannot be
   * relied upon for checking for user equivalence between services.
   */
  public readonly name: string | null;
  /**
   * The set of credentials which can be used to interact with the service this identity is
   * associated with.
   */
  public readonly credentials: T | null;
  /**
   * A map of additional identifiers for this identity.
   */
  public readonly identifiers: Map<string, string>;

  public readonly isAuthenticated: boolean;

  constructor(
    name: string | null,
    credentials: T | null,
    identifiers = new Map<string, string>()
  ) {
    this.name = name;
    this.credentials = credentials;
    this.identifiers = identifiers;
    this.isAuthenticated = Boolean(this.name);
  }
}
