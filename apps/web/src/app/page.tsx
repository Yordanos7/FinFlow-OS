import Link from "next/link";
import styles from "./stars.module.css";
import { User, LogIn, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.stars}></div>
      <div className={styles.stars2}></div>
      <div className={styles.stars3}></div>
      
      <div className={styles.mainWrapper}>
        <div className={styles.titleWrapper}>
          <div className="flex justify-center mb-6">
            <Image src="/logo.png" alt="FinFlow Logo" width={120} height={120} className="rounded-3xl shadow-2xl animate-pulse" />
          </div>
          <h1 className={styles.mainTitle}>FinFlow</h1>
          <p className={styles.subTitle}>Simplify Your Financial Workflow</p>
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
