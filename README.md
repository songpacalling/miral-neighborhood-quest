# 키보드로 알아보는 우리 동네

학생 6명의 검색 활동, 답안 수정, 교사용 현황판과 인쇄 화면을 제공합니다.

Vercel은 Next.js로 빌드하며, 서버가 Neon Postgres에 답안을 저장합니다. Neon을 프로젝트에 연결하면 첫 요청 때 필요한 표를 자동으로 만듭니다. 이전 수업의 기록을 가져오지는 않습니다. 연결 문자열은 Vercel의 환경 변수에만 보관하세요.

로컬 실행: Node.js 22에서 npm install 후 npm run dev. 로컬 데이터베이스는 .env.local의 DATABASE_URL로 설정합니다. 배포용 빌드는 npm run build입니다.
