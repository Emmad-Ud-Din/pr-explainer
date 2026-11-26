export async function POST (request:Request){

    let body;
    try{
        body= await request.json();
    }catch {
        return Response.json({error:"Request body must be JSON"}, {status:400});
    }

    const diff=body.diff;
    if(typeof diff !=='string'){
        return Response.json({error:"diff must be a string"}, {status:400});
    }

    if(diff.trim()===''){
        return Response.json({error:'there is no diff'}, {status:400});
    }

    return Response.json({characters: diff.length});
}
