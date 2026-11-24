import {neon} from '@neondatabase/serverless';
import {students,questionsFor,initialSeed} from '../../lib/content';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
function connect(){
  const url=process.env.DATABASE_URL || process.env.STORAGE_URL || process.env.POSTGRES_URL || process.env.STORAGE_DATABASE_URL || process.env.STORAGE_POSTGRES_URL;
  if(!url) throw Error('Missing database connection');
  return neon(url);
}
let initialized:Promise<unknown>|undefined;
async function room(){
  const sql=connect();
  initialized ??= sql.transaction([
    sql`SELECT pg_advisory_xact_lock(621111)`,
    sql`CREATE TABLE IF NOT EXISTS quiz_room(id integer PRIMARY KEY, seed integer NOT NULL, revealed boolean NOT NULL DEFAULT false)`,
    sql`CREATE TABLE IF NOT EXISTS quiz_answer(seed integer NOT NULL, student text NOT NULL, qid text NOT NULL, choice text NOT NULL, correct boolean NOT NULL, PRIMARY KEY(seed,student,qid))`,
    sql`INSERT INTO quiz_room(id,seed) VALUES (1,${initialSeed}) ON CONFLICT DO NOTHING`
  ]).catch(e=>{initialized=undefined;throw e});
  await initialized;
  const [r]=await sql`SELECT seed,revealed FROM quiz_room WHERE id=1`;
  return {sql,seed:Number(r.seed),revealed:Boolean(r.revealed)};
}
const unavailable=()=>json({error:'저장소에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'},503);
export async function GET(request:Request){
  try{
    const {sql,seed,revealed}=await room();
    const rows=await sql`SELECT student,qid,choice,correct FROM quiz_answer WHERE seed=${seed}`;
    const printing=new URL(request.url).searchParams.get('print')==='1';
    return json({seed,revealed,students:students.map(s=>({...s,questions:questionsFor(s.id,seed).map(q=>{
      const a=rows.find(x=>x.student===s.id&&x.qid===q.id);
      return {...q,answer:printing||a?q.answer:undefined,response:a?{choice:a.choice,correct:a.correct}:null};
    })}))});
  }catch{return unavailable()}
}
export async function POST(request:Request){
  try{
    if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return json({error:'요청을 확인해 주세요.'},403);
    const b=await request.json();
    const {sql,seed,revealed}=await room();
    const stale=()=>json({error:'활동 기록이 바뀌었어요. 화면을 다시 확인해 주세요.'},409);
    if(b.seed!==seed)return stale();
    if(b.action==='answer'||b.action==='revise'){
      const q=questionsFor(b.student,seed).find(x=>x.id===b.qid);
      if(!q||!q.options.includes(b.choice))return json({error:'보기를 다시 선택해 주세요.'},400);
      if(revealed)return stale();
      if(b.action==='answer'){
        await sql`INSERT INTO quiz_answer(seed,student,qid,choice,correct) SELECT seed,${b.student},${q.id},${b.choice},${b.choice===q.answer} FROM quiz_room WHERE id=1 AND seed=${seed} AND NOT revealed ON CONFLICT DO NOTHING`;
      }else{
        const changed=await sql`UPDATE quiz_answer a SET choice=${b.choice},correct=${b.choice===q.answer} FROM quiz_room r WHERE r.id=1 AND NOT r.revealed AND r.seed=${seed} AND a.seed=r.seed AND a.student=${b.student} AND a.qid=${q.id} AND a.choice=${b.previous} RETURNING a.qid`;
        if(!changed.length)return stale();
      }
    }else if(b.action==='reveal'){
      const target=students.reduce((n,s)=>n+questionsFor(s.id,seed).length,0);
      const rows=await sql`UPDATE quiz_room SET revealed=true WHERE id=1 AND seed=${seed} AND (SELECT count(*) FROM quiz_answer WHERE seed=${seed})=${target} RETURNING id`;
      if(!rows.length)return json({error:'모든 학생이 10문제를 마치면 최종 결과를 볼 수 있어요.'},400);
    }else if(b.action==='reset'&&b.confirm==='새 활동 시작'){
      const rows=await sql`UPDATE quiz_room SET seed=seed+1,revealed=false WHERE id=1 AND seed=${seed} RETURNING id`;
      if(!rows.length)return stale();
    }else return json({error:'지원하지 않는 요청입니다.'},400);
    return json({ok:true});
  }catch{return unavailable()}
}
