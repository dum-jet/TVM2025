import { c as C, Op, I32 } from "../../wasm";
import { Expr } from "../../lab04";
import { buildOneFunctionModule, Fn } from "./emitHelper";
const { i32, get_local } = C;
   
export function getVariables(e: Expr): string[] {  
    return traverseForVariables(e, []);
}

function traverseForVariables(ex: Expr, variables: string[]): string[] {
    switch (ex.type) {
        case 'Num':
            return variables;

        case 'Variable':
            if (!variables.includes(ex.name))
                variables.push(ex.name);
            return variables;

        case 'UnaryExpr':
            traverseForVariables(ex.operand, variables);
            return variables;

        case 'BinaryExpr':
            traverseForVariables(ex.left, variables);
            traverseForVariables(ex.right, variables);
            return variables;
            
        default:
            throw new Error("Unhandled expression type.");
    } 
}

export async function buildFunction(e: Expr, variables: string[]): Promise<Fn<number>>
{
    let expr = wasm(e, variables)
    return await buildOneFunctionModule("test", variables.length, [expr]);
}

function wasm(e: Expr, args: string[]): Op<I32> {
    switch (e.type) {
        case 'Num':
            return i32.const(e.value);

        case 'Variable':
            const index = args.indexOf(e.name);
            if (index == -1)
                throw new WebAssembly.RuntimeError();
            return get_local(i32, index);

        case 'UnaryExpr':
            if (e.operator == '-') 
                return i32.sub(i32.const(0), wasm(e.operand, args));
            else 
                throw new Error("Unhandled unary operation.");

        case 'BinaryExpr':
            const left = wasm(e.left, args);
            const right = wasm(e.right, args);
            switch (e.operator) {
                case '+':
                    return i32.add(left, right);
                case '-':
                    return i32.sub(left, right);
                case '*':
                    return i32.mul(left, right);
                case '/':
                    return i32.div_s(left, right);
                default:
                    throw new Error("Unhandled binary operation.");
            }
        default:
            throw new Error("Unhandled expression type.");
    }
}
