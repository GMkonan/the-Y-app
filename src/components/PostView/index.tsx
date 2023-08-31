import Image from "next/image";
import Link from "next/link";
import type { RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export type PostWithAuthor = RouterOutputs["posts"]["getAll"]["posts"][number];
const PostView = ({
  post: { id, content, createdAt },
  author,
}: PostWithAuthor) => {
  return (
    // object tag being used as hacky solution for nested links
    // https://kizu.dev/nested-links/
    <object className="m-0 p-0" type="owo/uwu">
      <Link href={`posts/${id}`}>
        <div
          className="flex w-full gap-4 border-y border-zinc-600 p-4 text-gray-200"
          key={id}
        >
          <div className="flex flex-col">
            <object className="m-0 p-0" type="owo/uwu">
              <Link
                href={author.username || ""}
                className="h-14 w-14 rounded-full"
              >
                <Image
                  src={author.profileImageUrl}
                  alt={`${author.username || "author"}'s profile image`}
                  className="h-14 w-14 rounded-full"
                  width={56}
                  height={56}
                />
              </Link>
            </object>
          </div>
          <div className="flex flex-col">
            <div className="flex gap-1">
              <object className="m-0 p-0" type="owo/uwu">
                <Link href={author.username || ""} className="hover:underline">
                  <span className="font-bold">{author.name}</span>
                </Link>
              </object>
              <div className="flex gap-1 text-gray-500">
                <object className="m-0 p-0" type="owo/uwu">
                  <Link href={author.username || ""}>
                    <span>{`@${
                      author.username?.toLowerCase() as string // temporary fix
                    }`}</span>
                  </Link>
                </object>
                <span>·</span>
                <object className="m-0 p-0" type="owo/uwu">
                  <Link href={`posts/${id}`}>
                    <span>{dayjs(createdAt).fromNow()}</span>
                  </Link>
                </object>
              </div>
            </div>
            <span>{content}</span>{" "}
            {/* Maybe have all content be upperCase by default just because */}
          </div>
        </div>
      </Link>
    </object>
  );
};

export default PostView;
