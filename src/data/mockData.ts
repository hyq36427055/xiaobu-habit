import type { Achievement, DailyRecord, GrowthState, Habit, Recommendation } from '../types';
export const habits:Habit[]=[
 {id:'read',name:'阅读15分钟',icon:'📖',frequency:'daily',frequencyLabel:'每天',target:1,targetUnit:'次',currentValue:0,streakDays:12,completedToday:false,color:'#edf5ea'},
 {id:'water',name:'喝水8杯',icon:'💧',frequency:'daily',frequencyLabel:'每天',target:8,targetUnit:'次',currentValue:0,streakDays:18,completedToday:false,color:'#eef6fb'},
 {id:'sport',name:'运动30分钟',icon:'👟',frequency:'weekly',frequencyLabel:'每周',target:5,targetUnit:'次',currentValue:0,streakDays:9,completedToday:false,color:'#edf5ef'},
 {id:'sleep',name:'早睡22:30',icon:'🌙',frequency:'daily',frequencyLabel:'每天',target:1,targetUnit:'次',currentValue:0,streakDays:15,completedToday:false,color:'#f3effb'},
 {id:'walk',name:'散步20分钟',icon:'🌳',frequency:'daily',frequencyLabel:'每天',target:1,targetUnit:'次',currentValue:0,streakDays:7,completedToday:false,color:'#eef5ed'},
 {id:'meditate',name:'冥想10分钟',icon:'🧘',frequency:'weekly',frequencyLabel:'每周',target:4,targetUnit:'次',currentValue:0,streakDays:5,completedToday:false,color:'#fbf3e9'}];
const statuses:DailyRecord['status'][]=['rest','complete','complete','partial','complete','complete','partial','complete','complete','partial','missed','complete','complete','partial','complete','missed','complete','partial','complete','missed','complete','complete','partial','missed','missed','complete','partial','missed','complete','complete','partial'];
export const records:DailyRecord[]=statuses.map((status,i)=>({date:`2026-07-${String(i+1).padStart(2,'0')}`,habitIds:['read','water','sport'],completedHabitIds:status==='complete'?['read','water','sport']:status==='partial'?['read','water']:[],status}));
export const growth:GrowthState={level:1,stage:'幼苗',currentValue:10,nextLevelValue:18,streakDays:0,totalCompleted:18,monthCompletedDays:22};
export const achievements:Achievement[]=[{id:'sprout',title:'第一颗芽',description:'完成首次任务',icon:'🌱',unlocked:true},{id:'reader',title:'阅读达人',description:'累计阅读10次',icon:'📚',unlocked:true},{id:'week',title:'连续一周',description:'连续打卡7天',icon:'🗓️',unlocked:true}];
export const recommendations:Recommendation[]=[{id:'wake',name:'早起',icon:'☀️',frequencyLabel:'每天',target:1,targetUnit:'次'},{id:'veg',name:'多吃蔬菜',icon:'🥦',frequencyLabel:'每天',target:1,targetUnit:'次'},{id:'focus',name:'专注25分钟',icon:'🎯',frequencyLabel:'每天',target:2,targetUnit:'次'}];
