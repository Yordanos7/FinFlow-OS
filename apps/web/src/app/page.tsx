import Link from "next/link";
import styles from "./stars.module.css";
import { User, LogIn, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.stars}></div>
      <div className={styles.stars2}></div>
      <div className={styles.stars3}></div>
      
      <div className={styles.mainWrapper}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.mainTitle}>FinFlowOs</h1>
          <p className={styles.subTitle}>Experience the Future</p>
        </div>

        <div className={styles.cardContainer}>
          {/* Welcome/Login Card */}
          <div className={styles.glassCard}>
            <div className={styles.cardIcon}>
              <LogIn size={48} strokeWidth={1.5} />
            </div>
            <h2 className={styles.cardTitle}>Welcome Back</h2>
            <p className={styles.cardDesc}>
              Access your personalized dashboard and continue your financial journey.
            </p>
            <Link href="/login" className={styles.buttonPrimary}>
              Sign In
            </Link>
          </div>

          {/* Register Card */}
          <div className={styles.glassCard}>
            <div className={styles.cardIcon}>
              <User size={48} strokeWidth={1.5} />
            </div>
            <h2 className={styles.cardTitle}>New Here?</h2>
            <p className={styles.cardDesc}>
              Create your account today and start managing your finances like a pro.
            </p>
            <Link href="/signup" className={styles.buttonSecondary}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
