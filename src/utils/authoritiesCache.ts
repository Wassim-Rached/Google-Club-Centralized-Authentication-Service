import NodeCache from "node-cache";
import config from "../config";

const authoritiesCache = new NodeCache({ stdTTL: config.cache.ttl });

// represents the format the authorities cache is stored in
export interface AccountAuthoritiesCache {
  [scope: string]: string[] | undefined;
}

// used to get all of the saved authorities cache keys
export function getAllAccountsAuthoritiesCache() {
  return authoritiesCache.keys();
}

// used to get account authorities cache for the specified scope
export function getAccountAuthoritiesCacheForScope(
  accountId: string,
  scope: string
): string[] | undefined {
  const authorities = authoritiesCache.get<AccountAuthoritiesCache>(accountId);
  if (!authorities) return undefined;

  return authorities[scope];
}

// used to set account authorities to the cache for a certain scope
export function setAccountAuthoritiesCacheForScope(
  accountId: string,
  scope: string,
  authorities: string[]
): void {
  const currentAuthorities =
    authoritiesCache.get<AccountAuthoritiesCache>(accountId);
  if (currentAuthorities) {
    authoritiesCache.set<AccountAuthoritiesCache>(accountId, {
      ...currentAuthorities,
      [scope]: authorities,
    });
  } else {
    authoritiesCache.set<AccountAuthoritiesCache>(accountId, {
      [scope]: authorities,
    });
  }
}

// gets all the accounts ids that have authorities cache
export function getAllAuthoritiesCacheKeys() {
  return authoritiesCache.keys();
}

// clear all authorities cache for a specific account
export function clearAuthoritiesCacheForAccount(accountId: string) {
  authoritiesCache.del(accountId);
}

// clear all authorities cache for all accounts
export function clearAllAccountsAuthoritiesCache() {
  authoritiesCache.flushAll();
}
