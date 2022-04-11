import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import styles from './card.module.scss';
import { formatDate } from '../../utils/formatDate';

type cardProps = {
  uid: string;
  title: string;
  subTitle: string;
  time: string;
  author: string;
};

export default function Card({
  uid,
  title,
  subTitle,
  time,
  author,
}: cardProps): JSX.Element {
  return (
    <article className={styles.article}>
      <div className={styles.text}>
        <Link href={`/post/${uid}`}>
          <a>
            <h3>{title}</h3>
            <p>{subTitle}</p>
          </a>
        </Link>
      </div>
      <div className={styles.info}>
        <p>
          <span>
            <FiCalendar />
          </span>
          <time>{formatDate(time)}</time>
        </p>

        <p>
          <span>
            <FiUser />
          </span>
          {author}
        </p>
      </div>
    </article>
  );
}
