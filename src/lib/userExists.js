import { currentUser } from "@clerk/nextjs/server";
import DB from "./prisma.db";

export default async function userExists() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await DB.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName} ${user?.lastName}`;

    const newUser = await DB.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });

    return newUser;
  } catch (error) {
    console.log(error.message);
  }
}
