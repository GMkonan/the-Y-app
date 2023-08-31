import { clerkClient } from "@clerk/nextjs";
import type { Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/nodejs";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { filterUserData } from "~/server/helpers/filterUserData";
import postFormSchema from "~/utils/postFormSchema";

const addUserDataToPosts = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map(({ authorId }) => authorId), // get only users with id = authorid
      limit: 100,
    })
  ).map(filterUserData);

  const clientPosts = posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);

    if (!author)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author not found",
      });

    return {
      post,
      author,
    };
  });

  return clientPosts;
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ cursor: z.string().nullish(), limit: z.number() }))
    .query(async ({ ctx, input }) => {
      const { limit = 35, cursor } = input;

      const posts = await ctx.prisma.post
        .findMany({
          take: limit + 1, // this 1 in the end will be used as cursor
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: { createdAt: "desc" },
        })
        .then(addUserDataToPosts);
      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextPost = posts.pop(); // return the last item from the array
        nextCursor = nextPost?.post.id;
      }
      return {
        posts,
        nextCursor,
      };
    }),
  getPostByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(
      async ({ input, ctx }) =>
        await ctx.prisma.post
          .findMany({
            take: 100,
            orderBy: { createdAt: "desc" },
            where: {
              authorId: input.userId,
            },
          })
          .then(addUserDataToPosts)
    ),
  getTotalPostCountByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(
      async ({ input, ctx }) =>
        await ctx.prisma.post.count({
          where: {
            authorId: input.userId,
          },
        })
    ),
  getPostById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
      });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      return (await addUserDataToPosts([post]))[0];
    }),
  createPost: privateProcedure
    .input(postFormSchema)
    .mutation(async ({ ctx, input: { content } }) => {
      const authorId = ctx.userId;

      // rate limiter by used id (identifier)

      // Create a new ratelimiter, that allows 3 requests per 1 minute
      const ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(3, "1 m"),
        analytics: true,
      });

      const { success } = await ratelimit.limit(authorId);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = await prisma.post.create({ data: { authorId, content } });

      return post;
    }),
});
