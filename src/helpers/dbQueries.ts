import { query } from "../utils/db";

type UserInfo = {
  id: number;
  password: string;
};

export async function getUserInfoByEmail(
  email: string
): Promise<UserInfo | null> {
  try {
    const result = await query(
      "SELECT id,password FROM user_account WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

export async function getUserAuthoritiesById(
  userId: string
): Promise<Array<string>> {
  try {
    const result = await query(
      `
      SELECT 
          'ROLE_' || r.name AS authority
      FROM 
          user_account ua
      JOIN 
          user_roles ur ON ua.id = ur.user_id
      JOIN 
          role r ON ur.role_id = r.id
      WHERE 
          ua.id = $1

      UNION

      SELECT 
          p.name AS authority
      FROM 
          user_account ua
      JOIN 
          user_roles ur ON ua.id = ur.user_id
      JOIN 
          role r ON ur.role_id = r.id
      JOIN 
          role_permissions rp ON r.id = rp.role_id
      JOIN 
          permission p ON rp.permission_id = p.id
      WHERE 
          ua.id = $1

      UNION

      SELECT 
          p.name AS authority
      FROM 
          user_account ua
      JOIN 
          user_permissions up ON ua.id = up.user_id
      JOIN 
          permission p ON up.permission_id = p.id
      WHERE 
          ua.id = $1;
      `,
      [userId]
    );

    // Combine all roles and permissions into a Set for uniqueness

    return result.rows.map((row) => row.authority);
  } catch (error) {
    console.error("Error fetching user authorities:", error);
    throw error;
  }
}
