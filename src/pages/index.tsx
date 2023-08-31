import { type NextPage } from "next";
import { Button } from "~/components";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import LoadingSpinner from "~/components/LoadingSpinner";
import { useToast } from "~/components/ui/use-toast";
import { Virtuoso } from "react-virtuoso";
import Layout from "~/components/Layout";
import type * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/Form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import postFormSchema from "~/utils/postFormSchema";
import { useCallback, useState } from "react";
import PostView from "~/components/PostView";

dayjs.extend(relativeTime);

const CreatePost = () => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = (values: z.infer<typeof postFormSchema>) => {
    mutate(values);
  };

  const { user } = useUser();
  if (!user) return <div>You are not logged in</div>;

  const ctx = api.useContext();

  // Mutation with TRPC
  const { mutate, isLoading: isPosting } = api.posts.createPost.useMutation({
    onSuccess: () => {
      form.resetField("content");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      toast({
        variant: "destructive",
        title:
          errorMessage && errorMessage[0]
            ? `${errorMessage[0]}`
            : "Failed to post",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 px-4">
        <div className="m-4 flex">
          <Image
            src={user.profileImageUrl}
            alt="Profile Image"
            className="h-14 w-14 rounded-full"
            width={56}
            height={56}
            priority={true}
          />
        </div>
        <div className="mt-4 flex grow flex-col">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <textarea
                    placeholder="What is happening?"
                    className="h-20 w-full overflow-hidden border-x border-transparent bg-transparent text-xl focus:outline-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="-ml-2 h-1 w-full border-t-[1px]" />

          <div className="flex w-full justify-end">
            <Button
              className="my-2 w-20 rounded-2xl text-sm text-gray-200"
              type="submit"
              disabled={isPosting || form.getValues("content") === ""}
            >
              Yeet
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

const Feed = () => {
  const [loading, setLoading] = useState(false);
  const [isEndOfFeed, setIsEndOfFeed] = useState(false);
  const {
    data: posts,
    isLoading,
    fetchNextPage,
  } = api.posts.getAll.useInfiniteQuery(
    { limit: 35 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const next = useCallback(async () => {
    setLoading(true);
    await fetchNextPage().then(() => setLoading(false));
  }, [fetchNextPage]);

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner width={48} height={48} />
      </div>
    );

  if (!posts) return <div>Something went wrong</div>;

  const data = posts.pages.flatMap((p) => p.posts);

  const Footer = () =>
    !isEndOfFeed ? (
      <div className="my-4 flex items-center justify-center">
        <Button disabled={loading} onClick={next}>
          Load More Yeets
        </Button>
      </div>
    ) : (
      <div className="my-4 flex items-center justify-center text-lg font-bold text-primary">
        End of Yeets
      </div>
    );
  return (
    <Virtuoso
      context={next}
      useWindowScroll
      data={data}
      itemContent={(index, { post, author }) => (
        <PostView post={post} author={author} key={index} />
      )}
      endReached={() => setIsEndOfFeed(true)}
      components={{ Footer }}
    />
  );
};

const Home: NextPage = () => {
  // Calling here to load asap, result gets cached and used in PostView automatically
  // I think since this is only for first render when entering the page it doesnt need to be
  // infinite query
  api.posts.getAll.useQuery({ limit: 35 });

  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded)
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner width={64} height={64} />
      </div>
    );

  return (
    <div className="flex justify-center">
      <Layout>
        {!isSignedIn && (
          <h3 className="p-2 text-xl">Home</h3>
          // <SignInButton mode="modal">
          //   <Button>Sign In</Button>
          // </SignInButton>
        )}
        {isSignedIn && <CreatePost />}
        <Feed />
      </Layout>
    </div>
  );
};

export default Home;
