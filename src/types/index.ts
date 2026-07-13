export type TabKey = 'home' | 'habits' | 'calendar' | 'profile';
export type HabitFrequency = 'daily' | 'weekly' | 'workdays' | 'custom';
export interface Habit { id:string; name:string; icon:string; frequency:HabitFrequency; frequencyLabel:string; target:number; targetUnit:string; currentValue:number; streakDays:number; completedToday:boolean; color?:string }
export interface DailyRecord { date:string; habitIds:string[]; completedHabitIds:string[]; status:'complete'|'partial'|'missed'|'rest' }
export interface GrowthState { level:number; stage:'种子'|'幼苗'|'小树'|'大树'; currentValue:number; nextLevelValue:number; streakDays:number; totalCompleted:number; monthCompletedDays:number }
export interface Achievement { id:string; title:string; description:string; icon:string; unlocked:boolean }
export interface Recommendation { id:string; name:string; icon:string; frequencyLabel:string; target:number; targetUnit:string }
