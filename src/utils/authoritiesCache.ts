import NodeCache from "node-cache";
import config from "../config";

const authoritiesCache = new NodeCache({ stdTTL: config.cache.ttl });

export function setAuthoritiesCacheForAccount(
  accountId: string,
  authorities: any
) {
  authoritiesCache.set(accountId, authorities);
}

export function getAuthoritiesCacheForAccount(accountId: string) {
  return authoritiesCache.get(accountId);
}

export function clearAuthoritiesCacheForAccount(accountId: string) {
  authoritiesCache.del(accountId);
}

export function clearAllAuthoritiesCache() {
  authoritiesCache.flushAll();
}
