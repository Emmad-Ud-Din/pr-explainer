export async function POST (request:Request){
    const body= await request.json();
    const diff= body.diff;

    return Response.json({characters: diff.length});
}
