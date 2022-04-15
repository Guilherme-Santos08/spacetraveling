/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import Link from 'next/link';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';

import styles from './post.module.scss';
import { formatDate } from '../../utils/formatDate';

interface Post {
  uid: string;
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
  nextPost: Post | null;
  prevPost: Post | null;
}

export default function Post({
  post,
  nextPost,
  prevPost,
}: PostProps): JSX.Element {
  const router = useRouter();

  const calculateReadingTime = () => {
    const wordsOfHeading = post.data.content.reduce((acc, data) => {
      if (data.heading) {
        // Esta juntando o acc e o data
        return [...acc, ...data.heading.split(' ')];
      }

      return [...acc];
    }, []).length;

    const wordsOfBody = RichText.asText(
      post.data.content.reduce((acc, data) => {
        // Jutando o acc e o data no mesmo array
        return [...acc, ...data.body];
      }, [])
      // Tranformando tudo em string e calculando o tamanho
    ).split(' ').length;

    // Conta para poder saber em quantos minutos o usuario vai ler aquele texto
    const readingTime = Math.ceil((wordsOfBody + wordsOfHeading) / 200);

    return readingTime;
  };

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
                  {calculateReadingTime()} min
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

      <div className={styles.postPrevOrNext}>
        {nextPost ? (
          <Link href={`${nextPost.uid}`}>
            <a>
              <div>
                <IoIosArrowBack />
                <span className={styles.arrowLeft}>
                  {nextPost?.data?.title}
                </span>
              </div>
            </a>
          </Link>
        ) : (
          <div />
        )}

        {prevPost ? (
          <Link href={`${prevPost.uid}`}>
            <a>
              <div>
                <span className={styles.arrowRight}>{prevPost.data.title}</span>
                <IoIosArrowForward />
              </div>
            </a>
          </Link>
        ) : (
          <div />
        )}
      </div>
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
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<unknown> = async ({ params }) => {
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

  const nextPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 1,
      orderings: '[document.first_publication_date]',
      after: response.id,
    }
  );

  const prevPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 1,
      orderings: '[document.first_publication_date desc]',
      after: response.id,
    }
  );

  return {
    props: {
      post,
      nextPost: nextPost.results[0] ?? null,
      prevPost: prevPost.results[0] ?? null,
    },
  };
};
