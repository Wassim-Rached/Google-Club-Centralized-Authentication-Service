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
