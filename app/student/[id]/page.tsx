import Classroom from '../../ui';
export default async function Student({params}:{params:Promise<{id:string}>}){const {id}=await params;return <Classroom studentId={id}/>}
