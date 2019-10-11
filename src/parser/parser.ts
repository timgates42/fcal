import { Lexer } from '../lex/lex';
import { Token, TokenType } from '../lex/token';
import { Phrases } from '../types/phrase';
import { Expr } from './expr';
import { TType } from '../types/units';
export class Parser {
  public source: string;
  private lexer: Lexer;
  private ntoken: number;
  private tokens: Token[];
  constructor(source: string, phrases: Phrases, ttypes: TType.TTypes) {
    this.source = source;
    this.lexer = new Lexer(this.source, phrases, ttypes);
    this.ntoken = 0;
    this.tokens = [];
  }
  public parse(): Expr {
    const expr = this.expressionStmt();
    return expr;
  }

  private expressionStmt(): Expr {
    const expr = this.expression();
    this.consume(TokenType.NEWLINE, 'Expecting new Line');
    return expr;
  }
  private expression(): Expr {
    return this.percentage();
  }

  private percentage(): Expr {
    let expr = this.addition();
    while (this.match(TokenType.OF)) {
      const operator = this.previous();
      const right = this.addition();
      expr = new Expr.Binary(expr, operator, right, expr.start, right.end);
    }
    return expr;
  }
  private addition(): Expr {
    let expr = this.multiply();
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.multiply();
      expr = new Expr.Binary(expr, operator, right, expr.start, right.end);
    }
    return expr;
  }

  private multiply(): Expr {
    let expr = this.unary();
    while (this.match(TokenType.TIMES, TokenType.SLASH, TokenType.MOD, TokenType.OF)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Expr.Binary(expr, operator, right, expr.start, right.end);
    }
    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Expr.Unary(operator, right, operator.start, right.end);
    }
    return this.exponent();
  }
  private exponent(): Expr {
    let expr = this.suffix();
    while (this.match(TokenType.CAP)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Expr.Binary(expr, operator, right, expr.start, right.end);
    }
    return expr;
  }
  // private unitConvert(): Expr {
  //   const expr = this.suffix();
  //   if (this.match(TokenType.IN)) {
  //     this.consume(TokenType.UNIT, 'Expecting unit after in');
  //     const unit = this.previous();
  //     const unit2 = this.add
  //   }
  // }
  private suffix(): Expr {
    const expr = this.term();
    if (this.match(TokenType.PERCENTAGE)) {
      const operator = this.previous();
      return new Expr.Percentage(expr, expr.start, operator.end);
    }
    if (this.match(TokenType.UNIT)) {
      const unit = this.previous();
      let unit2;
      [unit2] = this.lexer.ttypes.get(unit.lexeme);
      return new Expr.UnitExpr(expr, unit2, expr.start, unit.end);
    }
    return expr;
  }

  private term(): Expr {
    if (this.match(TokenType.Number)) {
      return new Expr.Literal(this.previous().Literal, this.previous().start, this.previous().end);
    }
    if (this.match(TokenType.OPEN_PARAN)) {
      const start = this.previous();
      const expr = this.expression();
      this.consume(TokenType.CLOSE_PARAN, "Expect ')' after expression");
      return new Expr.Grouping(expr, start.start, this.previous().end);
    }
    throw new Error(`Expect expression but found ${this.peek().lexeme}`);
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.incr();
        return true;
      }
    }
    return false;
  }
  private consume(type: TokenType, message: string) {
    if (this.check(type)) {
      this.incr();
      return;
    }
    throw new Error(message);
  }
  private check(type: TokenType): boolean {
    if (this.isAtEnd()) {
      return false;
    }
    return this.peek().type === type;
  }
  private isAtEnd(): boolean {
    const token = this.nextToken();
    return token.type === TokenType.EOL;
  }
  private nextToken(): Token {
    if (this.ntoken < this.tokens.length) {
      return this.tokens[this.ntoken];
    }
    return this.getToken();
  }
  private getToken(): Token {
    const token = this.lexer.Next();
    if (token.type !== TokenType.EOL) {
      this.tokens.push(token);
    }
    return token;
  }
  private previous(): Token {
    return this.tokens[this.ntoken - 1];
  }
  private peek(): Token {
    return this.nextToken();
  }
  private incr() {
    this.ntoken++;
  }
}
