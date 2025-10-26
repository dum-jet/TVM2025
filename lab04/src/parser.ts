import { MatchResult } from 'ohm-js';
import { arithGrammar, ArithmeticActionDict, ArithmeticSemantics, SyntaxError } from '../../lab03';
import { Expr, BinaryExpr, UnaryExpr, Variable, Num} from './ast';

export const getExprAst: ArithmeticActionDict<Expr> = {
    AddExpr(e, it1, it2): BinaryExpr {
        const operations = it1.children;
        return it2.children.reduce(
            (previousValue, currentValue, i) => ({
                type: 'BinaryExpr',
                left: previousValue,
                operator: operations[i].sourceString,
                right: currentValue.parse()
            }), e.parse()
        );
    },

    MulExpr(e, it1, it2): BinaryExpr {
        const operations = it1.children;
        return it2.children.reduce(
            (previousValue, currentValue, i) => ({
                type: 'BinaryExpr',
                left: previousValue,
                operator: operations[i].sourceString,
                right: currentValue.parse()
            }), e.parse()
        );
    },

    Atom_paren(_, e, __) {
        return e.parse();
    },

    Atom_neg(_, e): UnaryExpr {
        return {type: 'UnaryExpr', operator: '-', operand: e.parse()}
    },

    number(_): Num {
        return {type: 'Num', value: parseInt(this.sourceString)};
    },

    variable(_, __): Variable {
        return {type: 'Variable', name: this.sourceString};
    },

}

export const semantics = arithGrammar.createSemantics();
semantics.addOperation("parse()", getExprAst);

export interface ArithSemanticsExt extends ArithmeticSemantics
{
    (match: MatchResult): ArithActionsExt
}

export interface ArithActionsExt 
{
    parse(): Expr
}

export function parseExpr(source: string): Expr
{
    const match = arithGrammar.match(source);
    if (match.failed()) {
        throw new SyntaxError(match.message);
    }
    return semantics(match).parse();
}


    
