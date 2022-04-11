/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { formatDate } from '../../utils/formatDate';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <Header />

      {router.isFallback ? (
        <h2 className={styles.loading}>Carregando...</h2>
      ) : (
        <article className={styles.article}>
          <div className={styles.banner}>
            <img src={post.data.banner.url} alt="banner" />
          </div>
          <div className="content-global">
            <header className={styles.header}>
              <h1>{post.data.title}</h1>
              <div className={styles.headerInfo}>
                <p>
                  <span>
                    <FiCalendar />
                  </span>
                  <time>{formatDate(post.first_publication_date)}</time>
                </p>
                <p>
                  <span>
                    <FiUser />
                  </span>
                  {post.data.author}
                </p>
                <p>
                  <span>
                    <FiClock />
                  </span>
                  4 min
                </p>
              </div>
            </header>
            <div className={styles.postContent}>
              {post.data.content.map(({ heading, body }) => (
                <div key={heading}>
                  <h3>{heading}</h3>
                  <div
                    dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}
                  />
                </div>
              ))}
            </div>
          </div>
        </article>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      pageSize: 2,
    }
  );

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
  };
};
