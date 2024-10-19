import { query } from "../utils/db";

type Account = {
  id: number;
  password: string;
  is_email_verified: boolean;
  is_locked: boolean;
};

export async function queryAccountInfoByEmail(
  email: string
): Promise<Account | null> {
  try {
    const result = await query(
      "SELECT id,password,is_email_verified,is_locked FROM accounts WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error fetching account:", error);
    throw error;
  }
}

export async function queryAccountAuthoritiesById(
  accountId: string,
  scope: string
): Promise<Array<string>> {
  try {
    const result = await query(
      // SELECT
      //     r.scope || '.role.' || r.name AS authority
      // FROM
      //     accounts ua
      // JOIN
      //     account_roles ur ON ua.id = ur.account_id
      // JOIN
      //     roles r ON ur.role_id = r.id
      // WHERE
      //     ua.id = $1
      //     AND (r.scope = $2 )

      // UNION
      `
      SELECT 
          p.scope || '.perm.' || p.name AS authority
      FROM 
          accounts ua
      JOIN 
          account_roles ur ON ua.id = ur.account_id
      JOIN 
          roles r ON ur.role_id = r.id
      JOIN 
          role_permissions rp ON r.id = rp.role_id
      JOIN 
          permissions p ON rp.permission_id = p.id
      WHERE 
          ua.id = $1
          AND (p.scope = $2)

      UNION

      SELECT 
          p.scope || '.perm.' || p.name AS authority
      FROM 
          accounts ua
      JOIN 
          account_permissions up ON ua.id = up.account_id
      JOIN 
          permissions p ON up.permission_id = p.id
      WHERE 
          ua.id = $1
          AND (p.scope = $2);
      `,
      [accountId, scope]
    );

    return result.rows.map((row) => row.authority);
  } catch (error) {
    console.error("Error fetching account authorities:", error);
    return [];
  }
}
