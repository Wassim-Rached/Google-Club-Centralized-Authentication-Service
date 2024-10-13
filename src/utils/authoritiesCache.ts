import NodeCache from "node-cache";
import config from "../config";
import { AuthoritiesList } from "../authorities";

const authoritiesCache = new NodeCache({ stdTTL: config.cache.ttl });

export function appendAuthoritiesCacheForAccount(
  accountId: string,
  authorities: AuthoritiesList
) {
  const currentAuthorities = authoritiesCache.get(accountId) as AuthoritiesList;
  if (currentAuthorities) {
    authoritiesCache.set<AuthoritiesList>(accountId, [
      ...currentAuthorities,
      ...authorities,
    ]);
  } else {
    authoritiesCache.set<AuthoritiesList>(accountId, authorities);
  }
}

export function getAuthoritiesCacheForAccount(
  accountId: string,
  scope: string
) {
  const authorities = authoritiesCache.get(accountId) as string[] | undefined;
  if (!authorities) return undefined;
  return authorities.filter((authority: string) => {
    return (
      authority.startsWith(scope) ||
      authority.startsWith(config.server.globalAuthoritiesScope)
    );
  });
}

export function clearAuthoritiesCacheForAccount(accountId: string) {
  authoritiesCache.del(accountId);
}

export function clearAllAuthoritiesCache() {
  authoritiesCache.flushAll();
}
