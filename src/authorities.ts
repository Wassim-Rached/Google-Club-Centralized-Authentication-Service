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
export async function getAccountAuthorities(
  accountId: string,
  scope: string,
  forceDbQuery = false
): Promise<string[]> {
  let authorities: string[] = [];

  // handle scope authorities
  let currentScopeAuthorities: string[] = [];

  if (!forceDbQuery) {
    currentScopeAuthorities =
      getAccountAuthoritiesCacheForScope(accountId, scope) || [];
  }

  if (forceDbQuery || currentScopeAuthorities.length === 0) {
    // query from db
    currentScopeAuthorities =
      (await queryAccountAuthoritiesById(accountId, scope)) || [];
    setAccountAuthoritiesCacheForScope(
      accountId,
      scope,
      currentScopeAuthorities
    );
  }

  authorities = currentScopeAuthorities;

  // handle global authorities
  let globalAuthorities: string[] = [];

  if (!forceDbQuery) {
    globalAuthorities =
      getAccountAuthoritiesCacheForScope(accountId, "global") || [];
  }

  if (forceDbQuery || globalAuthorities.length === 0) {
    globalAuthorities =
      (await queryAccountAuthoritiesById(accountId, "global")) || [];
    setAccountAuthoritiesCacheForScope(accountId, "global", globalAuthorities);
  }

  // final result
  authorities = [...authorities, ...globalAuthorities];

  return authorities;
}
