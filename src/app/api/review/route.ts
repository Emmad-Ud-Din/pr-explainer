import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod.mjs";
import { ReviewSchema } from "@/lib/review/schema";

const client = new Anthropic();

const SYSTEM_PROMPT=`You are a senior software engineer reviewing a pull request. Your job
is to look for any bugs, security issues, unhandled errors and edge cases. You can ignore any
style or formatting nitpicks, they are not necessary. For each risk, name the file, the line 
in the new version when possible, and the exact code involved. If there are no real problems,
you should return an empty risks list, do not invent any issues. In a diff,lines
starting with + were added, - were removed, and the rest are unchanged context.`

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

    const response = await client.messages.parse({
        model:"claude-opus-5-5",
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        output_config:{
            format:zodOutputFormat(ReviewSchema),
        },
        messages: [
            {
                role:'user',
                content:` Review this diff: \n\n${diff}`,
            },
        ],
    });

    const review= response.parsed_output ;
    if(!review){
        return Response.json({error: "The AI's answer did not match the review format."}, 
            {status:502}
        )
    }

    return Response.json({review, usage:response.usage});
}
