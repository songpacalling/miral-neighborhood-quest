import {env} from 'cloudflare:workers';
import {students,questionsFor,initialSeed} from '../../lib/content';
export const dynamic='force-dynamic';
const json=(x:any,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store'}});
async function current(){const db=env.DB!;await db.prepare('INSERT OR IGNORE INTO room (id,seed,revealed) VALUES (2,?,0)').bind(initialSeed).run();return await db.prepare('SELECT * FROM room WHERE id=2').first<any>();}
export async function GET(request:Request){try{const r=await current();const rows=(await env.DB!.prepare('SELECT * FROM answers WHERE seed=?').bind(r.seed).all()).results;const printing=new URL(request.url).searchParams.get('print')==='1';return json({seed:r.seed,revealed:!!r.revealed,students:students.map(s=>({...s,questions:questionsFor(s.id,r.seed).map(q=>{const a:any=rows.find((x:any)=>x.student===s.id&&x.qid===q.id);return {...q,answer:printing||a?q.answer:undefined,response:a?{choice:a.choice,correct:!!a.correct}:null};})}))});}catch{return json({error:'저장소에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'},503);}}
export async function POST(request:Request){try{if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return json({error:'요청을 확인해 주세요.'},403);const body=await request.json();const r=await current();const db=env.DB!;if(body.seed!==r.seed)return json({error:'새 활동이 시작되었어요. 화면을 새로고침해 주세요.'},409);
if(body.action==='revise'){
const q=questionsFor(body.student,r.seed).find(x=>x.id===body.qid);
if(!q||!q.options.includes(body.choice))return json({error:'보기를 다시 선택해 주세요.'},400);
const result=await db.prepare('UPDATE answers SET choice=?,correct=? WHERE seed=? AND student=? AND qid=? AND choice=? AND EXISTS (SELECT 1 FROM room WHERE id=2 AND seed=? AND revealed=0)').bind(body.choice,Number(body.choice===q.answer),r.seed,body.student,q.id,body.previous,r.seed).run();
if(!result.meta.changes)return json({error:'활동 결과가 공개되었거나 응답이 바뀌었어요. 화면을 다시 확인해 주세요.'},409);
return json({ok:true});}
if(body.action==='answer'){const q=questionsFor(body.student,r.seed).find(x=>x.id===body.qid);if(!q||!q.options.includes(body.choice))return json({error:'보기를 다시 선택해 주세요.'},400);await db.prepare('INSERT OR IGNORE INTO answers (seed,student,qid,choice,correct,created) SELECT ?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM room WHERE id=2 AND seed=?)').bind(r.seed,body.student,q.id,body.choice,Number(body.choice===q.answer),new Date().toISOString(),r.seed).run();return json({ok:true});}
if(body.action==='reveal'){const rows=(await db.prepare('SELECT student,qid FROM answers WHERE seed=?').bind(r.seed).all()).results;const done=students.every(s=>questionsFor(s.id,r.seed).every(q=>rows.some(a=>a.student===s.id&&a.qid===q.id)));if(!done)return json({error:'모든 학생이 10문제를 마치면 최종 결과를 볼 수 있어요.'},400);await db.prepare('UPDATE room SET revealed=1 WHERE id=2 AND seed=?').bind(r.seed).run();return json({ok:true});}
if(body.action==='reset'&&body.confirm==='새 활동 시작'){await db.prepare('UPDATE room SET seed=?,revealed=0 WHERE id=2 AND seed=?').bind(r.seed+1,r.seed).run();return json({ok:true});}return json({error:'지원하지 않는 요청입니다.'},400);}catch{return json({error:'저장하지 못했어요. 연결을 확인하고 다시 눌러 주세요.'},503);}}
