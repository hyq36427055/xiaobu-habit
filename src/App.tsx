import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { growth as seedGrowth, habits as seedHabits, records as seedRecords } from './data/mockData';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { DailyRecord, Habit, TabKey } from './types';
import { AppShell, BottomTabBar, GrowthCard, HabitItem, PageHeader } from './components/Shared';

const head:Record<TabKey,[string,string]>={home:['早上好','今天完成一点点吧'],habits:['正在成长的习惯','每一次坚持，都是未来的你在发芽'],calendar:['成长足迹','回顾每一步，见证成长'],profile:['我的成长','每一步都算数']};
const weekdays=['日','一','二','三','四','五','六'];
const now = new Date();
const todayKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
const initialSelectedDay = now.getFullYear()===2026 && now.getMonth()===6 ? now.getDate() : 12;
const dateKey=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const greetingFor=(hour:number):[string,string]=>{
  if(hour<5)return ['夜深了','早点休息，明天再继续前进吧'];
  if(hour<11)return ['早上好','新的一天，从一小步开始吧'];
  if(hour<14)return ['中午好','忙碌之余，也别忘了照顾自己'];
  if(hour<18)return ['下午好','再完成一点点吧'];
  if(hour<23)return ['晚上好','今天也辛苦了，完成最后一小步吧'];
  return ['夜深了','放下今天，安心休息吧'];
};
const levelForDays=(days:number):Pick<typeof seedGrowth,'level'|'stage'|'currentValue'|'nextLevelValue'>=>{
  if(days<18)return {level:1,stage:'幼苗',currentValue:days,nextLevelValue:18};
  if(days<45)return {level:2,stage:'小树',currentValue:days-18,nextLevelValue:27};
  return {level:3,stage:'大树',currentValue:1,nextLevelValue:1};
};
const consecutiveDays=(completedDates:Set<string>)=>{
  const cursor=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  if(!completedDates.has(dateKey(cursor)))cursor.setDate(cursor.getDate()-1);
  let days=0;
  while(completedDates.has(dateKey(cursor))){days++;cursor.setDate(cursor.getDate()-1)}
  return days;
};
function Home({habits,toggle,go,growth}:{habits:Habit[];toggle:(id:string)=>void;go:(t:TabKey)=>void;growth:typeof seedGrowth}){const [leaving,setLeaving]=useState<Set<string>>(()=>new Set());const pending=habits.filter(h=>!h.completedToday||leaving.has(h.id));const completeWithDelay=(id:string)=>{if(leaving.has(id))return;setLeaving(current=>new Set(current).add(id));toggle(id);window.setTimeout(()=>setLeaving(current=>{const next=new Set(current);next.delete(id);return next}),500)};return <main className="main-content home-page"><GrowthCard growth={growth} onClick={()=>go('profile')}/><section className="card today"><div className="section-head"><h2>今日任务</h2><button onClick={()=>go('habits')}>查看全部 <ChevronRight/></button></div><div className="today-list inner-scroll">{pending.length?pending.map(h=><HabitItem key={h.id} habit={h} onToggle={()=>completeWithDelay(h.id)}/>):<div className="list-empty">{habits.length?'今天的任务已完成':'还没有小目标'}<br/><small>{habits.length?'做得很好，明天继续 🌱':'去习惯页种下第一个吧 🌱'}</small></div>}</div></section><p className="brand">每一步都算数 🌱</p></main>}
function Habits({habits,toggle,remove,open}:{habits:Habit[];toggle:(id:string)=>void;remove:(id:string)=>void;open:()=>void}){return <main className="main-content habits-page simplified"><section className="card habit-list-card"><div className="habit-list-scroll inner-scroll">{habits.length?habits.map(h=><HabitItem key={h.id} habit={h} mode="list" onToggle={()=>toggle(h.id)} onDelete={()=>remove(h.id)}/>):<div className="list-empty">这里还没有习惯<br/><small>从一个简单的小目标开始吧 🌱</small></div>}</div></section><button className="add-habit" onClick={open}>🌱　种下新的小目标</button></main>}
function Calendar({records,selected,setSelected,month,setMonth,habits}:{records:DailyRecord[];selected:number;setSelected:(n:number)=>void;month:{y:number;m:number};setMonth:(v:{y:number;m:number})=>void;habits:Habit[]}){
  const changeMonth=(offset:number)=>{const nextDate=new Date(month.y,month.m-1+offset,1);const y=nextDate.getFullYear();const m=nextDate.getMonth()+1;setMonth({y,m});setSelected(Math.min(selected,new Date(y,m,0).getDate()))};
  const prev=()=>changeMonth(-1);
  const next=()=>changeMonth(1);
  const prefix=`${month.y}-${String(month.m).padStart(2,'0')}-`;
  const monthRecords=records.filter(item=>item.date.startsWith(prefix));
  const recordMap=new Map(monthRecords.map(item=>[Number(item.date.slice(-2)),item]));
  const daysInMonth=new Date(month.y,month.m,0).getDate();
  const firstWeekday=new Date(month.y,month.m-1,1).getDay();
  const previousMonthDays=new Date(month.y,month.m-1,0).getDate();
  const leadingDays=Array.from({length:firstWeekday},(_,index)=>previousMonthDays-firstWeekday+index+1);
  const currentDays=Array.from({length:daysInMonth},(_,index)=>index+1);
  const trailingDays=Array.from({length:42-leadingDays.length-currentDays.length},(_,index)=>index+1);
  const selectedKey=`${month.y}-${String(month.m).padStart(2,'0')}-${String(selected).padStart(2,'0')}`;
  const record=records.find(item=>item.date===selectedKey)??{date:selectedKey,habitIds:[],completedHabitIds:[],status:'rest' as const};
  const existingIds=new Set(habits.map(h=>h.id));
  const dayHabitIds=habits.map(h=>h.id);
  const dayCompletedIds=selectedKey<=todayKey?record.completedHabitIds.filter(id=>dayHabitIds.includes(id)):[];
  const normalizedStatus=(item?:DailyRecord):DailyRecord['status']=>{
    if(!item||item.date>todayKey||item.status==='rest')return 'rest';
    const completedCount=new Set(item.completedHabitIds.filter(id=>existingIds.has(id))).size;
    if(habits.length>0&&completedCount===habits.length)return 'complete';
    return completedCount>0?'partial':'missed';
  };
  const completeDays=monthRecords.filter(r=>normalizedStatus(r)==='complete').length;
  const trackedDays=monthRecords.filter(r=>normalizedStatus(r)!=='rest').length;
  const rate=trackedDays?Math.round(completeDays/trackedDays*100):0;
  return <main className="main-content calendar-page"><section className="card calendar-card"><div className="calendar-top"><div className="month-title"><button onClick={prev} aria-label="上个月"><ChevronLeft/></button><strong>{month.y}年 {month.m}月</strong><button onClick={next} aria-label="下个月"><ChevronRight/></button></div><div className="month-stats"><span>本月完成<strong>{completeDays}<small>天</small></strong></span><i/><span>坚持率<strong>{rate}<small>%</small></strong></span></div></div><div className="weekdays">{weekdays.map(d=><span key={d}>{d}</span>)}</div><div className="calendar-grid">{leadingDays.map((day,index)=><span className="other" key={`previous-${index}`}>{day}</span>)}{currentDays.map(day=>{const dayRecord=recordMap.get(day);const status=normalizedStatus(dayRecord);return <button key={day} className={selected===day?'selected':''} onClick={()=>setSelected(day)} aria-label={`${month.m}月${day}日`}><span>{day}</span><i className={status}>{status==='complete'&&<Check/>}</i></button>})}{trailingDays.map((day,index)=><span className="other" key={`next-${index}`}>{day}</span>)}</div><div className="legend"><span><i className="complete"><Check/></i>已完成</span><span><i className="partial"/>部分完成</span><span><i className="missed"/>未完成</span></div></section><section className="card day-card"><h2>{month.m}月{selected}日 · 周{weekdays[new Date(month.y,month.m-1,selected).getDay()]}</h2><div className="day-list inner-scroll">{dayHabitIds.map(id=>{const h=habits.find(x=>x.id===id);const done=dayCompletedIds.includes(id);return h?<div key={id}><span className="mini-icon">{h.icon}</span><strong>{h.name}</strong><i className={done?'complete':'missed'}>{done&&<Check/>}</i></div>:null})}</div><p>已完成 <strong>{dayCompletedIds.length}/{dayHabitIds.length}</strong> 项</p></section></main>;
}
function Profile({growth,onReset}:{growth:typeof seedGrowth;onReset:()=>void}){return <main className="main-content profile-page minimal-profile"><GrowthCard growth={growth} profile/><section className="card stats"><div>🌱<span>已坚持<strong>{growth.streakDays}<small> 天</small></strong></span></div><div>📖<span>完成次数<strong>{growth.totalCompleted}<small> 次</small></strong></span></div><div>🗓️<span>本月打卡<strong>{growth.monthCompletedDays}<small> 天</small></strong></span></div></section><section className="quote"><b>“</b><span><strong>今日一句</strong>每一次坚持，都会让未来的你感谢现在的自己。</span></section><button className="reset-data" onClick={onReset}>清空全部数据</button></main>}
function Drawer({close,save}:{close:()=>void;save:(name:string,icon:string,frequency:'daily'|'weekly',target:number)=>void}){const [name,setName]=useState('');const [icon,setIcon]=useState('🌱');const [frequency,setFrequency]=useState<'daily'|'weekly'>('daily');const [target,setTarget]=useState(1);return <div className="drawer-mask" onClick={close}><form className="drawer" onClick={e=>e.stopPropagation()} onSubmit={e=>{e.preventDefault();if(name.trim())save(name.trim(),icon,frequency,target)}}><i/><h2>种下新的小目标</h2><label>习惯名称<input value={name} onChange={e=>setName(e.target.value)} placeholder="例如：写日记" required/></label><label>图标<select value={icon} onChange={e=>setIcon(e.target.value)}><option value="🌱">🌱 幼苗</option><option value="📖">📖 阅读</option><option value="💧">💧 喝水</option><option value="👟">👟 运动</option><option value="🌙">🌙 早睡</option><option value="🧘">🧘 冥想</option><option value="📝">📝 语文</option><option value="🔢">🔢 数学</option><option value="🔤">🔤 外语</option><option value="🎵">🎵 音乐</option><option value="🎨">🎨 绘画</option><option value="🧹">🧹 整理</option></select></label><div className="form-row"><label>执行频率<select value={frequency} onChange={e=>setFrequency(e.target.value as 'daily'|'weekly')}><option value="daily">每天</option><option value="weekly">每周</option></select></label><label>每次目标<input type="number" min="1" value={target} onChange={e=>setTarget(Math.max(1,Number(e.target.value)||1))}/></label></div><button className="save" type="submit">保存小目标</button></form></div>}
export default function App(){
  const [tab,setTab]=useState<TabKey>('home');
  const [habits,setHabits]=useLocalStorage<Habit[]>('smallstep-habits-v2',seedHabits);
  const [records,setRecords]=useLocalStorage<DailyRecord[]>('smallstep-records-v2',seedRecords);
  const [growth,setGrowth]=useLocalStorage('smallstep-growth-v2',seedGrowth);
  const [selected,setSelected]=useState(initialSelectedDay);
  const [month,setMonth]=useState({y:2026,m:7});
  const [drawer,setDrawer]=useState(false);
  const [currentHour,setCurrentHour]=useState(()=>new Date().getHours());

  useEffect(()=>{
    const timer=window.setInterval(()=>setCurrentHour(new Date().getHours()),60_000);
    return ()=>window.clearInterval(timer);
  },[]);

  const validRecords=useMemo(()=>records.filter(record=>record.date<=todayKey),[records]);
  const calculatedHabits=useMemo(()=>habits.map(habit=>{
    const completedDates=new Set(validRecords.filter(record=>record.completedHabitIds.includes(habit.id)).map(record=>record.date));
    return {...habit,streakDays:consecutiveDays(completedDates)};
  }),[habits,validRecords]);
  const calculatedGrowth=useMemo(()=>{
    const existingIds=new Set(habits.map(habit=>habit.id));
    const completedByDay=validRecords.map(record=>({date:record.date,count:new Set(record.completedHabitIds.filter(id=>existingIds.has(id))).size}));
    const totalCompleted=completedByDay.reduce((sum,item)=>sum+item.count,0);
    const currentMonth=todayKey.slice(0,7);
    const monthCompletedDays=completedByDay.filter(item=>item.date.startsWith(currentMonth)&&item.count>0).length;
    const activeDates=new Set(completedByDay.filter(item=>item.count>0).map(item=>item.date));
    return {...growth,...levelForDays(activeDates.size),totalCompleted,monthCompletedDays,streakDays:consecutiveDays(activeDates)};
  },[growth,habits,validRecords]);

  const statusFor=(habitIds:string[],completedIds:string[]):DailyRecord['status']=>{
    if(!habitIds.length)return 'rest';
    if(!completedIds.length)return 'missed';
    return completedIds.length>=habitIds.length?'complete':'partial';
  };

  useEffect(()=>{
    const habitIds=habits.map(h=>h.id);
    const completedHabitIds=habits.filter(h=>h.completedToday).map(h=>h.id);
    setRecords(current=>{
      let found=false;
      const next=current.map(record=>{
        if(record.date!==todayKey)return record;
        found=true;
        return {...record,habitIds,completedHabitIds,status:statusFor(habitIds,completedHabitIds)};
      });
      if(!found)next.push({date:todayKey,habitIds,completedHabitIds,status:statusFor(habitIds,completedHabitIds)});
      return next;
    });
  },[habits]);

  const toggle=(id:string)=>{
    const was=habits.find(h=>h.id===id)?.completedToday??false;
    const nextCompleted=!was;
    const knownIds=new Set(habits.map(h=>h.id));
    knownIds.add(id);
    let foundToday=false;
    const nextRecords=records.map(record=>{
      if(record.date!==todayKey)return record;
      foundToday=true;
      const habitIds=[...new Set([...record.habitIds,...record.completedHabitIds,id])].filter(item=>knownIds.has(item));
      const completedHabitIds=(nextCompleted?[...new Set([...record.completedHabitIds,id])]:record.completedHabitIds.filter(item=>item!==id)).filter(item=>habitIds.includes(item));
      return {...record,habitIds,completedHabitIds,status:statusFor(habitIds,completedHabitIds)};
    });
    if(!foundToday)nextRecords.push({date:todayKey,habitIds:[id],completedHabitIds:nextCompleted?[id]:[],status:nextCompleted?'complete':'missed'});
    setHabits(habits.map(h=>h.id===id?{...h,completedToday:nextCompleted}:h));
    setRecords(nextRecords);
  };

  const remove=(id:string)=>{
    setHabits(habits.filter(h=>h.id!==id));
    setRecords(records.map(record=>{const habitIds=record.habitIds.filter(item=>item!==id);const completedHabitIds=record.completedHabitIds.filter(item=>item!==id);return {...record,habitIds,completedHabitIds,status:statusFor(habitIds,completedHabitIds)}}));
  };

  const reset=()=>{if(confirm('确定清空全部习惯和成长记录吗？此操作无法撤销。')){setHabits([]);setRecords(seedRecords.map(r=>({...r,habitIds:[],completedHabitIds:[],status:'rest' as const})));setGrowth({...seedGrowth,currentValue:0,streakDays:0,totalCompleted:0,monthCompletedDays:0})}};

  const save=(name:string,icon:string,frequency:'daily'|'weekly',target:number)=>{
    const id=crypto.randomUUID();
    setHabits([...habits,{id,name,icon,frequency,frequencyLabel:frequency==='daily'?'每天':'每周',target,targetUnit:'次',currentValue:0,streakDays:0,completedToday:false,color:'#f1f6f1'}]);
    setRecords(records.map(record=>record.date===todayKey?{...record,habitIds:[...new Set([...record.habitIds,id])],status:statusFor([...new Set([...record.habitIds,id])],record.completedHabitIds)}:record));
    setDrawer(false);
  };

  const page=useMemo(()=>tab==='home'?<Home habits={calculatedHabits} toggle={toggle} go={setTab} growth={calculatedGrowth}/>:tab==='habits'?<Habits habits={calculatedHabits} toggle={toggle} remove={remove} open={()=>setDrawer(true)}/>:tab==='calendar'?<Calendar records={records} selected={selected} setSelected={setSelected} month={month} setMonth={setMonth} habits={calculatedHabits}/>:<Profile growth={calculatedGrowth} onReset={reset}/>,[tab,calculatedHabits,records,calculatedGrowth,selected,month]);
  const headerCopy=tab==='home'?greetingFor(currentHour):head[tab];
  return <AppShell><PageHeader title={headerCopy[0]} subtitle={headerCopy[1]} profile={tab==='profile'}/>{page}<BottomTabBar active={tab} onChange={setTab}/>{drawer&&<Drawer close={()=>setDrawer(false)} save={save}/>}</AppShell>;
}
