import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import LoadingSpinner from "~/components/LoadingSpinner";
import Layout from "~/components/Layout";
import { generateSSGHelper } from "~/server/helpers/generateSSGHelper";
import Image from "next/image";
import { BsArrowLeft } from "react-icons/bs";
import Link from "next/link";
import { type PostWithAuthor } from "~/components/PostView";
import { NextSeo } from "next-seo";

dayjs.extend(relativeTime);

const SinglePostView = ({
  post: { content, createdAt },
  author,
}: PostWithAuthor) => {
  return (
    <div>
      <div className="sticky top-0 z-30 flex h-12 items-center gap-8 bg-gray-950 px-4 backdrop-blur-md">
        <Link href="/">
          <BsArrowLeft className="text-2xl font-bold" />
        </Link>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex gap-2">
          <Image
            src={author.profileImageUrl}
            width={48}
            height={48}
            alt={author.name || ""}
            className="h-12 w-12 rounded-full"
          />
          <div className="flex flex-col">
            <span className="font-bold">{author.name}</span>
            <span>@{author.username}</span>
          </div>
        </div>
        <div>
          <span>{content}</span>
        </div>
        <div>
          <span className="text-gray-400">{dayjs(createdAt).fromNow()}</span>
        </div>
      </div>
    </div>
  );
};

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data, isLoading } = api.posts.getPostById.useQuery({ id });

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner width={64} height={64} />
      </div>
    );

  if (!data) return <div>404</div>;

  return (
    <Layout>
      <NextSeo
        title="Post"
        description="Twitter like post"
        twitter={{
          handle: "@GuilhermeKonan",
          site: "@GuilhermeKonan",
          cardType: "summary_large_image",
        }}
        openGraph={{
          type: "website",
          url: "https://the-y-app.vercel.app/",
          title: "Y",
          description: "Twitter like post",
          images: [
            {
              url: `https://the-y-app.vercel.app/api/og?title=${
                data.post.content
              }&author=${data.author.name || "author"}`,
              width: 1200,
              height: 600,
              alt: "Y Post",
            },
          ],
        }}
      />
      <SinglePostView {...data} />
    </Layout>
  );
};

export default SinglePostPage;

export const getStaticProps: GetStaticProps = async (ctx) => {
  const ssg = generateSSGHelper();

  const id = ctx.params?.id;

  if (typeof id !== "string") throw new Error("No Post");

  // get specific post
  await ssg.posts.getPostById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking", // getStaticProps called before initial render
  };
};
