import { TokenType, type TokenParserOptions, type TokenizerOptions } from "@streamparser/json"

import TokenParser, { ParsedElementInfo, ParsedTokenInfo, TokenParserState } from "./parser"
import Tokenizer from "./tokenizer"

export interface JSONParserOptions extends TokenizerOptions, TokenParserOptions {}

export default class JSONParser {
  private tokenizer
  private tokenParser

  constructor(opts: JSONParserOptions = {}) {
    this.tokenizer = new Tokenizer(opts)
    this.tokenParser = new TokenParser(opts)

    this.tokenizer.onToken = this.tokenParser.write.bind(this.tokenParser)
    this.tokenizer.onEnd = () => {
      if (!this.tokenParser.isEnded) this.tokenParser.end()
    }

    this.tokenParser.onError = this.tokenizer.error.bind(this.tokenizer)
    this.tokenParser.onEnd = () => {
      if (!this.tokenizer.isEnded) this.tokenizer.end()
    }
  }

  public get isEnded(): boolean {
    return this.tokenizer.isEnded && this.tokenParser.isEnded
  }

  public write(input: Iterable<number> | string): void {
    this.tokenizer.write(input)
  }

  public end(): void {
    this.tokenizer.end()
  }

  public set onToken(cb: (parsedTokenInfo: ParsedTokenInfo) => void) {
    this.tokenizer.onToken = parsedToken => {
      const valueTokenTypes = [
        TokenType.STRING,
        TokenType.NUMBER,
        TokenType.TRUE,
        TokenType.FALSE,
        TokenType.NULL
      ]

      if (
        this.tokenParser.state === TokenParserState.VALUE &&
        valueTokenTypes.includes(parsedToken.token)
      ) {
        cb({
          state: this.tokenParser.state,
          key: this.tokenParser.key,
          mode: this.tokenParser.mode,
          stack: this.tokenParser.stack,
          ...parsedToken
        })
      }

      this.tokenParser.write(parsedToken)
    }
  }

  public set onValue(cb: (parsedElementInfo: ParsedElementInfo) => void) {
    this.tokenParser.onValue = cb
  }

  public set onError(cb: (err: Error) => void) {
    this.tokenizer.onError = cb
  }

  public set onEnd(cb: () => void) {
    this.tokenParser.onEnd = () => {
      if (!this.tokenizer.isEnded) this.tokenizer.end()
      cb.call(this.tokenParser)
    }
  }
}
