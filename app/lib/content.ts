export type Question={id:string;topic:string;question:string;keyword:string;options:string[];answer:string};
const q=(id:string,topic:string,question:string,keyword:string,options:string[],answer:string):Question=>({id,topic,question,keyword,options,answer});
export const students=[{id:'minje',name:'김도윤',color:'#146D68'},{id:'taeyun',name:'박지호',color:'#375CAA'},{id:'suyul',name:'한서진',color:'#8A5734'},{id:'jeongmin',name:'윤지안',color:'#7957A3'},{id:'seunga',name:'최서연',color:'#B24668'},{id:'sanghun',name:'이가온',color:'#39744C'}];
const bank=[
q('v2-school','밀알학교','밀알학교는 서울의 어느 구에 있나요?','밀알학교 주소',['강남구','강동구','송파구','서초구'],'강남구'),
q('v2-station','일원역','일원역은 지하철 몇 호선인가요?','일원역 몇 호선',['3호선','2호선','4호선','7호선'],'3호선'),
q('v9-postcode','밀알학교 우편번호','밀알학교에 편지를 보낼 때 쓰는 우편번호는 무엇인가요?','밀알학교 우편번호',['06350','06240','06410','06120'],'06350'),
q('v2-mountain','대모산','대모산의 높이는 몇 미터인가요?','대모산 높이',['293m','100m','500m','800m'],'293m'),
q('v2-animal','양재천','양재천에서 발견된 멸종위기 동물은?','양재천 멸종위기 동물',['수달','호랑이','판다','코끼리'],'수달'),
q('v2-park','일원에코파크','일원에코파크의 공원 입장료는?','일원에코파크 입장료',['무료','1,000원','5,000원','10,000원'],'무료'),
q('v2-sport','마루공원','마루공원에는 어떤 공 운동장이 있나요?','마루공원 운동장',['풋살장','야구장','럭비장','골프장'],'풋살장'),
q('v5-suseo','부산행 KTX','밀알학교 근처 어느 역에서 KTX를 탈 수 있나요?','밀알학교 근처 KTX',['수서역','일원역','대청역','학여울역'],'수서역'),
q('v3-bike','서울 자전거 대여소','서울시에서 빌려 주는 공공자전거의 이름은?','서울 공공자전거 이름',['따릉이','씽씽이','달림이','나들이'],'따릉이'),
q('v2-hospital','삼성서울병원','삼성서울병원에서 아픈 사람에게 하는 일은?','삼성서울병원 하는 일',['진료','공연','배달','판매'],'진료')];
const replacements:Record<string,Question>={
'v2-mountain':q('v2-mountain','대모산','대모산은 옛날에 어떤 이름으로 불렸나요?','대모산 옛 이름',['할미산','남산','북한산','관악산'],'할미산'),
'v2-park':q('v2-park','일원에코파크','일원에코파크는 몇 년에 개장했나요?','일원에코파크 개장 연도',['2017년','2000년','2010년','2020년'],'2017년')};
function shuffle<T>(arr:T[],seed:number){let n=seed>>>0;const a=[...arr];for(let i=a.length-1;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const j=n%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
export function questionsFor(id:string,seed:number){const index=students.findIndex(s=>s.id===id);if(index<0)return [];const list=bank.map(q=>(id==='jeongmin'||id==='suyul')?(replacements[q.id]||q):q);return shuffle(list,seed+index*7919).map((q,i)=>({...q,options:shuffle(q.options,seed+index*1237+i*97)}));}
export const initialSeed=20261111;
