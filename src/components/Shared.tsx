import { useRef, type ReactNode } from "react";
import {
  CalendarDays,
  Check,
  House,
  ListChecks,
  UserRound,
} from "lucide-react";
import type { GrowthState, Habit, TabKey } from "../types";
import { AvatarPicker } from "./AvatarPicker";
export function PageHeader({
  title,
  subtitle,
  profile = false,
}: {
  title: string;
  subtitle: string;
  profile?: boolean;
}) {
  return (
    <header className={`page-header ${profile ? "profile-head" : ""}`}>
      {profile && <AvatarPicker large />}
      <div className="header-copy">
        <h1>
          {title} <span>🌱</span>
        </h1>
        <p>{subtitle}</p>
      </div>
      {!profile && <AvatarPicker />}
    </header>
  );
}
export function AppShell({ children }: { children: ReactNode }) {
  return <div className="app-shell">{children}</div>;
}
const tabs = [
  ["home", "首页", House],
  ["habits", "习惯", ListChecks],
  ["calendar", "日历", CalendarDays],
  ["profile", "我的", UserRound],
] as const;
export function BottomTabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  return (
    <nav className="bottom-tabs">
      {tabs.map(([key, label, Icon]) => (
        <button
          key={key}
          className={`tab ${active === key ? "active" : ""}`}
          onClick={() => onChange(key)}
          aria-current={active === key ? "page" : undefined}
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
export function ProgressBar({ value, max }: { value: number; max: number }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
    >
      <i style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );
}
export function GrowthCard({
  growth,
  profile = false,
  onClick,
}: {
  growth: GrowthState;
  profile?: boolean;
  onClick?: () => void;
}) {
  const maxed = growth.stage === "大树";
  const remaining = Math.max(0, growth.nextLevelValue - growth.currentValue);
  const art =
    growth.stage === "幼苗" ? (
      <img
        src={`${import.meta.env.BASE_URL}seedling.png`}
        alt="两片新叶的幼苗"
      />
    ) : (
      <span role="img" aria-label={growth.stage}>
        {growth.stage === "小树" ? "🌿" : "🌳"}
      </span>
    );
  const content = (
    <>
      <div className="growth-art">{art}</div>
      <div className="growth-copy">
        <h2>
          <b>Lv.{growth.level}</b> {growth.stage}
        </h2>
        <p>{maxed ? "已经长成大树" : `再坚持 ${remaining} 天升级`}</p>
        <ProgressBar value={growth.currentValue} max={growth.nextLevelValue} />
      </div>
      {!profile && (
        <div className="streak">
          <span>连续坚持</span>
          <strong>
            {growth.streakDays}
            <small> 天</small>
          </strong>
        </div>
      )}
    </>
  );
  return onClick ? (
    <button
      className={`card growth-card ${profile ? "profile-growth" : ""}`}
      onClick={onClick}
    >
      {content}
    </button>
  ) : (
    <div className={`card growth-card ${profile ? "profile-growth" : ""}`}>
      {content}
    </div>
  );
}
export function HabitItem({
  habit,
  onToggle,
  mode = "home",
  onDelete,
}: {
  habit: Habit;
  onToggle: () => void;
  mode?: "home" | "list";
  onDelete?: () => void;
}) {
  const timer = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0 });
  const cancelLongPress = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };
  const requestDelete = () => {
    cancelLongPress();
    if (
      onDelete &&
      window.confirm(`确定删除“${habit.name}”吗？删除后无法恢复。`)
    )
      onDelete();
  };
  const startLongPress = (event: React.PointerEvent) => {
    if (mode !== "list" || !onDelete) return;
    cancelLongPress();
    origin.current = { x: event.clientX, y: event.clientY };
    timer.current = window.setTimeout(requestDelete, 600);
  };
  const trackMove = (event: React.PointerEvent) => {
    if (
      Math.hypot(
        event.clientX - origin.current.x,
        event.clientY - origin.current.y,
      ) > 10
    )
      cancelLongPress();
  };
  return (
    <div className={`habit-item ${habit.completedToday ? "done" : ""} ${mode}`}>
      <div
        className="habit-main long-press-area"
        role={mode === "list" ? "button" : undefined}
        tabIndex={mode === "list" ? 0 : undefined}
        aria-label={mode === "list" ? `${habit.name}，长按删除` : undefined}
        onPointerDown={startLongPress}
        onPointerUp={cancelLongPress}
        onPointerCancel={cancelLongPress}
        onPointerLeave={cancelLongPress}
        onPointerMove={trackMove}
        onContextMenu={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (
            mode === "list" &&
            (event.key === "Enter" || event.key === "Delete")
          )
            requestDelete();
        }}
      >
        <span className="habit-icon" style={{ background: habit.color }}>
          {habit.icon}
        </span>
        <span className="habit-text">
          <strong>{habit.name}</strong>
          <small>
            {mode === "home"
              ? `目标：${habit.target}${habit.targetUnit} · 连续坚持：${habit.streakDays}天`
              : `${habit.frequencyLabel} · ${habit.target}${habit.targetUnit}`}
          </small>
        </span>
        {mode === "list" && (
          <span className="streak-label">连续 {habit.streakDays} 天</span>
        )}
      </div>
      <button
        className={`complete ${habit.completedToday ? "checked" : ""}`}
        onClick={onToggle}
        aria-label={`${habit.completedToday ? "取消完成" : "完成"}${habit.name}`}
      >
        <Check />
        {mode === "home" && (
          <span>{habit.completedToday ? "已完成" : "未完成"}</span>
        )}
      </button>
    </div>
  );
}
