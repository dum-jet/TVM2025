import { ReversePolishNotationActionDict } from "./rpn.ohm-bundle";

export const rpnStackDepth = {
    RpnExpr_plus(x, y, _) {
        const xDepth = x.stackDepth;
        const yDepth = y.stackDepth;
        
        let maxDepth:number;
        if (xDepth.max > xDepth.out + yDepth.max) {
            maxDepth = xDepth.max;
        } else {
            maxDepth = xDepth.out + yDepth.max;
        }
        
        return {max: maxDepth, out: xDepth.out + yDepth.out - 1};
    },

    RpnExpr_times(x, y, _) {
        const xDepth = x.stackDepth;
        const yDepth = y.stackDepth;
        
        let maxDepth:number;
        if (xDepth.max > xDepth.out + yDepth.max) {
            maxDepth = xDepth.max;
        } else {
            maxDepth = xDepth.out + yDepth.max;
        }
        
        return {max: maxDepth, out: xDepth.out + yDepth.out - 1};
    },

    RpnExpr(e) {
        return e.stackDepth;
    },

    number(_) {
        return {max: 1, out: 1};
    }
} satisfies ReversePolishNotationActionDict<StackDepth>;
export type StackDepth = {max: number, out: number};
