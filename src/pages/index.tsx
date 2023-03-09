import { useClerk, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import { api, RouterOutputs } from "~/utils/api";
import { Loading } from "~/components/loading";

type TweetData = RouterOutputs["posts"]["getAll"][number];

const TweetView = (props: { tweet: TweetData }) => {
  return (
    <div className="relative border-t border-zinc-700 p-4 shadow-lg">
      <Link
        href={`/post/${props.tweet.id}`}
        className="absolute left-0 top-0 z-0 h-full w-full"
      />
      <div className="pointer-events-none relative z-10 flex items-center">
        <Link
          href={`/profile/${props.tweet.user.username}`}
          className="pointer-events-auto"
        >
          <img
            src={props.tweet.user.profileImageUrl}
            alt={`Profile for ${props.tweet.user.username}`}
            className="h-14 w-14 rounded-full"
          />
        </Link>
        <div className="ml-3 flex flex-col text-2xl">
          <div className="text-base font-bold text-slate-300">
            <Link
              href={`/profile/${props.tweet.user.username}`}
              className="pointer-events-auto"
            >
              <span>{`@${props.tweet.user.username}`}</span>
            </Link>

            <Link
              href={`/post/${props.tweet.id}`}
              className="pointer-events-auto"
            >
              <span className="font-thin">{` · ${dayjs(
                props.tweet.createdAt
              ).fromNow()}`}</span>
            </Link>
          </div>
          <div className="text-slate-300">{props.tweet.content}</div>
        </div>
      </div>
    </div>
  );
};

const CreatePostWizard = () => {
  const [content, setContent] = useState("");

  const ctx = api.useContext();
  const { mutate, isLoading } = api.posts.createPost.useMutation({
    onSuccess: () => {
      setContent("");
      ctx.invalidate();
    },
  });

  const { user } = useUser();

  return (
    <div className="relative flex w-full">
      <img
        src={user?.profileImageUrl}
        alt="Profile"
        className="m-4 h-14 w-14 rounded-full"
      />
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isLoading}
        className="my-4 grow bg-transparent py-4 pr-20 text-xl outline-none"
        placeholder="Type some emojis"
        autoFocus
      />
      <div className="absolute right-2 flex h-full flex-col justify-center">
        {!!content && (
          <button onClick={() => mutate({ message: content })}>POST!</button>
        )}
      </div>
    </div>
  );
};

const CustomSignIn = () => {
  const { openSignIn } = useClerk();

  return (
    <div className="flex flex-col items-center justify-center text-xl">
      <button onClick={() => openSignIn()}>Sign In</button>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  const { isLoaded: userLoaded, user } = useUser();

  if (postsLoading || !userLoaded)
    return (
      <div className="absolute flex h-screen w-screen items-center justify-center">
        <Loading size={128} />
      </div>
    );

  return (
    <div className="flex h-full w-full grow flex-col border-l border-r border-zinc-700 md:w-[600px]">
      {!user && <CustomSignIn />}
      {user && <CreatePostWizard />}
      {data?.map((post) => (
        <TweetView key={post.id} tweet={post} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>😶 Emojer</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center bg-black text-white">
        <Feed />
      </main>
    </>
  );
};

export default Home;
