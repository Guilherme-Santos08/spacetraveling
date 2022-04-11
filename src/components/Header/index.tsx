import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.header}>
      <div className="content-global">
        <Link href="/">
          <a>
            <img src="../Logo.png" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  );
}
