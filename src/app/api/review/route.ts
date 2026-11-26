import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

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
        return Response.json({error:'paste a diff to review'}, {status:400});
    }

    const response = await client.messages.create({
        model:"claude-opus-5-5",
        max_tokens: 4000,
        messages: [
            {
                role:'user',
                content:` Review this pull request diff and point out any bugs: \n\n${diff}`,
            },
        ],
    });

    const textBlock= response.content.find((block)=> block.type==='text');
    const review = textBlock?.type==='text'? textBlock.text:'';

    return Response.json({review, usage:response.usage});
}
