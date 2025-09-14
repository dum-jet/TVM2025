import { MatchResult } from "ohm-js";
import grammar from "./rpn.ohm-bundle";
import { rpnSemantics } from "./semantics";

export function evaluate(source: string): number
{ 
    return rpnSemantics(parse(source)).calculate();
}

export function maxStackDepth(source: string): number
{ 
    throw "Not implemented";
}


export class SyntaxError extends Error {}

function parse(content: string): MatchResult
{
    const match = grammar.match(content);
    if (match.failed())  {
        throw new SyntaxError(match.message);
    }
    return match;
}



