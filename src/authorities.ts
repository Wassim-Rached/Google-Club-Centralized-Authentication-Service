import { queryAccountAuthoritiesById } from "./helpers/dbQueries";
import {
  getAccountAuthoritiesCacheForScope,
  setAccountAuthoritiesCacheForScope,
} from "./utils/authoritiesCache";

export const AUTHORITIES = {
  view_account_cache: "cas.perm.view_account_cache",
  clear_account_cache: "cas.perm.clear_account_cache",
  clear_all_accounts_cache: "cas.perm.clear_all_accounts_cache",
};

// handles getting account authorities from the cache or the database
// and also appends global authorities to the account authorities
// usually will be used when wanting to get the account authorities
export async function getAccountAuthoritiesForScope(
  accountId: string,
  scope: string,
  forceDbQuery = false
): Promise<string[]> {
  let authorities: string[] = [];

  if (!forceDbQuery) {
    authorities = getAccountAuthoritiesCacheForScope(accountId, scope) || [];
  }

  if (forceDbQuery || authorities.length === 0) {
    // query from db
    authorities = (await queryAccountAuthoritiesById(accountId, scope)) || [];
    setAccountAuthoritiesCacheForScope(accountId, scope, authorities);
  }

  return authorities;
}

export async function getAccountAuthorities(
  accountId: string,
  scopes: string[],
  forceDbQuery = false
): Promise<string[]> {
  let authorities: string[] = [];

  for (const scope of scopes) {
    const currentScopeAuthorities = await getAccountAuthoritiesForScope(
      accountId,
      scope,
      forceDbQuery
    );
    authorities = [...authorities, ...currentScopeAuthorities];
  }

  return authorities;
}
