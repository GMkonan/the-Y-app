import type { GetStaticProps, NextPage } from "next";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Layout from "~/components/Layout";
import { generateSSGHelper } from "~/server/helpers/generateSSGHelper";
import { api } from "~/utils/api";
import { BsArrowLeft } from "react-icons/bs";
import Link from "next/link";
import Image from "next/image";
import LoadingSpinner from "~/components/LoadingSpinner";
import { Virtuoso } from "react-virtuoso";
import PostView from "~/components/PostView";

dayjs.extend(relativeTime);

const ProfileFeed = ({ userId }: { userId: string }) => {
  // get posts from specific user, getting all for now...
  const { data: posts, isLoading } = api.posts.getPostByUserId.useQuery({
    userId,
  });

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner width={48} height={48} />
      </div>
    );

  if (!posts) return <div>Something went wrong</div>;

  return (
    <Virtuoso
      useWindowScroll
      data={posts}
      itemContent={(index, { post, author }) => (
        <PostView post={post} author={author} key={index} />
      )}
    />
  );
};

// feed and profile feed are so similar... should it be a component that receives a "what to return if !posts"?

const Profile: NextPage<{ username: string }> = ({ username }) => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div className="text-3xl font-bold">404</div>;

  const { data: postsCount } = api.posts.getTotalPostCountByUserId.useQuery({
    userId: data.id,
  });

  return (
    <Layout>
      <div className="bg-gray-300/45 sticky top-0 z-30 flex items-center gap-8 px-4 backdrop-blur-md">
        <Link href="/">
          <BsArrowLeft className="text-2xl font-bold" />
        </Link>
        <div className="flex flex-col">
          <span className="text-xl font-bold">{data.name}</span>
          <span className="text-sm text-gray-400">
            {postsCount || 0} Ls
          </span>{" "}
        </div>
      </div>
      <div className="relative h-52 bg-gray-600">
        <Image
          src={data.profileImageUrl}
          alt={data.name || ""}
          height={133}
          width={133}
          className="absolute bottom-0 left-5 -mb-14 rounded-full border-4 border-gray-700"
        />
      </div>
      <div className="h-[72px]" />
      <div className="mb-4 flex px-4">
        <div className="flex flex-col">
          <span className="text-xl font-bold">{data.name}</span>
          <span className="text-gray-400">@{data.username}</span>
        </div>
      </div>
      <ProfileFeed userId={data.id} />
    </Layout>
  );
};

export default Profile;

export const getStaticProps: GetStaticProps = async (ctx) => {
  const ssg = generateSSGHelper();

  const username = ctx.params?.slug;

  if (typeof username !== "string") throw new Error("No slug");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};
