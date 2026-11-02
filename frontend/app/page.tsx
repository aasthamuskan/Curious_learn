"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { userService } from "@/services/user-service";
import { User, UserStats } from "@/types";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";

/**
 * DashboardContent — yeh main dashboard component hai.
 * Isme user ki profile aur stats backend se fetch karke display hoti hain.
 */
function DashboardContent() {
  // User ki basic profile info store karne ke liye state
  const [user, setUser] = useState<User | null>(null);

  // User ke XP, streak, hearts, gems jaise stats store karne ke liye state
  const [stats, setStats] = useState<UserStats | null>(null);

  // Jab tak data load ho raha hai tab tak loading true rahega
  const [loading, setLoading] = useState<boolean>(true);

  // Agar koi error aaye toh uska message yahan store hoga
  const [error, setError] = useState<string | null>(null);

  /**
   * loadDashboard — yeh async function dashboard ka saara data fetch karta hai.
   * Dono APIs (user profile aur user stats) simultaneously call hoti hain
   * Promise.all ki madad se — ek saath dono ka wait karta hai, faster hota hai.
   */
  const loadDashboard = async () => {
    setLoading(true);   // Loading shuru — spinner dikhao
    setError(null);     // Pehle ki koi error ho toh clear karo

    try {
      // Dono API calls ek saath fire karo — time bachta hai
      const [userRes, statsRes] = await Promise.all([
        userService.getCurrentUser(),   // Logged-in user ki info lo
        userService.getUserStats(),     // User ke game stats lo (XP, streak, etc.)
      ]);

      setUser(userRes);   // User data state mein save karo
      setStats(statsRes); // Stats data state mein save karo
    } catch (err: any) {
      // Kuch bhi galat gaya toh error message set karo
      setError(err?.message || "Failed to load user profile from backend.");
    } finally {
      // Chahe success ho ya fail — loading band karo
      setLoading(false);
    }
  };

  /**
   * useEffect — component pehli baar mount hone par loadDashboard call karo.
   * Empty dependency array [] matlab sirf ek baar chalega (on mount).
   */
  useEffect(() => {
    loadDashboard();
  }, []);

  // Agar abhi bhi data aa raha hai, toh full-page loading screen dikhao
  if (loading) {
    return <LoadingState message="Loading dashboard data..." fullPage />;
  }

  // Agar error aaya, ya user/stats nahi mila, toh error screen dikhao retry option ke saath
  if (error || !user || !stats) {
    return (
      <ErrorState
        title="Backend Connection Failed"
        message={error || "Could not retrieve user context."}
        onRetry={loadDashboard}  // Retry button dabane par dobara data load karo
      />
    );
  }

  /**
   * dailyGoalPercent — aaj ke XP ko daily goal se divide karke percentage nikalo.
   * Math.min se ensure karo ki value kabhi 100 se zyada na ho (overflow rokne ke liye).
   */
  const dailyGoalPercent = Math.min(
    100,
    Math.round((stats.daily_xp / stats.daily_goal_xp) * 100)
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Welcome Card — user ka naam aur "Continue Learning" button */}
      <Card className="relative overflow-hidden border-2 border-[#37464f] p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Avatar circle — user ke naam ka pehla letter bada karke dikhao */}
            <div className="w-16 h-16 rounded-2xl bg-[#58cc02] flex items-center justify-center text-black font-black text-3xl shadow-[0_4px_0_#46a302]">
              {user.display_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                {/* Welcome message — user ka naam dynamically insert hoga */}
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Welcome back, {user.display_name}!
                </h1>
                {/* "Learner" badge — green color mein */}
                <Badge variant="green">Learner</Badge>
              </div>
              {/* Username @handle format mein */}
              <p className="text-sm text-gray-400 font-medium">@{user.username}</p>
            </div>
          </div>

          {/* /learn page par jaane ka button — primary style, large size */}
          <Link href="/learn">
            <Button variant="primary" size="lg" className="w-full md:w-auto">
              Continue Learning →
            </Button>
          </Link>
        </div>
      </Card>

      {/* Stats Overview Grid — 4 cards: Streak, XP, Hearts, Gems */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Streak Card — kitne din se lagatar padh raha hai */}
        <Card className="text-center space-y-1">
          <div className="text-3xl">🔥</div>
          <div className="text-xl font-black text-[#ff9600]">
            {stats.current_streak} Days
          </div>
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Current Streak
          </div>
        </Card>

        {/* Total XP Card — ab tak kitna total XP kamaya */}
        <Card className="text-center space-y-1">
          <div className="text-3xl">⭐</div>
          <div className="text-xl font-black text-[#ffc800]">
            {stats.total_xp} XP
          </div>
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Total Earned
          </div>
        </Card>

        {/* Hearts Card — kitne lives bache hain (max 5) */}
        <Card className="text-center space-y-1">
          <div className="text-3xl">❤️</div>
          <div className="text-xl font-black text-[#ff4b4b]">
            {stats.hearts} / 5
          </div>
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Hearts Remaining
          </div>
        </Card>

        {/* Gems Card — user ka gem balance (in-app currency) */}
        <Card className="text-center space-y-1">
          <div className="text-3xl">💎</div>
          <div className="text-xl font-black text-[#1cb0f6]">
            {stats.gems}
          </div>
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Gems Balance
          </div>
        </Card>
      </div>

      {/* Daily Progress Goal Card — aaj ka XP progress bar ke saath */}
      <Card className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-base text-gray-200">
              Daily XP Goal
            </h3>
            {/* Aaj kitna XP mila aur target kya hai */}
            <p className="text-xs text-gray-400">
              {stats.daily_xp} of {stats.daily_goal_xp} XP earned today
            </p>
          </div>
          {/* Agar 100% goal achieve hua toh green badge, warna yellow with percentage */}
          <Badge variant={dailyGoalPercent >= 100 ? "green" : "yellow"}>
            {dailyGoalPercent >= 100 ? "Goal Reached!" : `${dailyGoalPercent}%`}
          </Badge>
        </div>
        {/* Progress bar — h-4 height, value percentage mein */}
        <ProgressBar value={dailyGoalPercent} height="h-4" />
      </Card>
    </div>
  );
}

/**
 * HomePage — yeh app ka default export aur root page component hai.
 * ProtectedRoute wrap karta hai DashboardContent ko —
 * matlab agar user logged in nahi hai toh yahan access nahi milega.
 */
export default function HomePage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
