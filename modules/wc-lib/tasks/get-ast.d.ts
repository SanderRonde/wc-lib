import * as ts from 'typescript';
export declare namespace AST {
    interface Config {
        node: ts.Node;
        replacements: Replacement[];
        isExpr(node: ts.Node): boolean;
        findExpr(node: ts.Expression): ts.Node | null;
        decodeExpr(node: ts.Node): {
            str: string;
            lastNode: ts.Node;
        } | null;
    }
    interface Replacement {
        start: number;
        end: number;
        str: string;
        node: ts.Node;
        inString: boolean;
    }
    function resolveStringLiteral(node: ts.Node): string | number | null;
    function isIgnored(node: ts.Node, ignoreString: string): boolean;
    function find(config: Config): void;
    function applyReplacements(text: string, replacements: Replacement[]): string;
    function getAST(code: string): ts.SourceFile | undefined;
}
//# sourceMappingURL=get-ast.d.ts.map