import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';

import { useState } from 'react';
import Head from 'next/head';

import Card from '../components/Card';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [loadMorePost, setLoadMorePost] = useState(postsPagination.next_page);

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const morePost = async () => {
    const postResult = await fetch(loadMorePost);
    const dataPost = await postResult.json();

    const newPost = [...posts, ...dataPost.results];
    setLoadMorePost(dataPost.next_page);
    setPosts(newPost);
  };

  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>
      <Header />
      <main className="content-global">
        <section className={styles.section}>
          {posts.map(post => (
            <Card
              key={post.uid}
              uid={post.uid}
              title={post.data.title}
              subTitle={post.data.subtitle}
              author={post.data.author}
              time={post.first_publication_date}
            />
          ))}
          {loadMorePost && (
            <button type="button" className={styles.button} onClick={morePost}>
              Carregar mais posts
            </button>
          )}
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 2,
    }
  );

  const posts = postsResponse.results.map((post: Post) => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
    revalidate: 60 * 5, // Atualiza o banco a cada 5 minutos
  };
};
