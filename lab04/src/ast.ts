export type Expr = BinaryExpr | UnaryExpr | Variable | Num;

export type BinaryOperator = '+' | '-' | '*' | '/';
export type UnaryOperator = '-';

export interface BinaryExpr {
  type: 'BinaryExpr',
  left: Expr,
  operator: BinaryOperator,
  right: Expr,
}

export interface UnaryExpr {
  type: 'UnaryExpr',
  operator: UnaryOperator,
  operand: Expr,
}

export interface Variable {
    type: 'Variable',
    name : string,
};

export interface Num {
    type: 'Num',
    value: number,
};
