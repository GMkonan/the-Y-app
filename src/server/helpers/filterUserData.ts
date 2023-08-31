import type { User } from "@clerk/nextjs/dist/types/server";

export const filterUserData = (user: User) => ({
  id: user.id,
  name: user.firstName,
  username: user.username,
  profileImageUrl: user.profileImageUrl,
});
