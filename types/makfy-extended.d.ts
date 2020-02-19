import {
    FlagArgDefinition,
    StringArgDefinition,
} from 'makfy/dist/lib/schema/args';
import { ExecCommand, ExecFunction } from 'makfy/dist/lib/schema/runtime';

interface ExtendedEnumArgDefinition<V extends string> {
    type: 'enum' | 'e';
    values: V[];
    byDefault?: V;
    desc?: string;
}

declare type ExtendedArgDefinition =
    | FlagArgDefinition
    | StringArgDefinition
    // @ts-ignore
    | ExtendedEnumArgDefinition;
interface ExtendedArgDefinitions {
    [argName: string]: ExtendedArgDefinition;
}
declare type ExtendedArgInstance<
    T extends ExtendedArgDefinition
> = T extends FlagArgDefinition
    ? boolean
    : T extends StringArgDefinition
    ? string
    : T extends ExtendedEnumArgDefinition<infer V>
    ? V
    : string | boolean;
declare type ExtendedArgsInstance<TArgDefs extends ExtendedArgDefinitions> = {
    [k in keyof TArgDefs]: ExtendedArgInstance<TArgDefs[k]>;
};
declare type ExtendedCommandRunFn<TArgDefs extends ExtendedArgDefinitions> = (
    exec: ExecFunction,
    args: ExtendedArgsInstance<TArgDefs>
) => Promise<void>;
declare class ExtendedCommandBuilder<TArgDefs extends ExtendedArgDefinitions> {
    private readonly name;
    private _command;
    constructor(name: string);
    desc(desc: string): this;
    args<TNewArgDefs extends ExtendedArgDefinitions>(
        argDefs: TNewArgDefs
    ): ExtendedCommandBuilder<TNewArgDefs>;
    argsDesc(
        argDescs: {
            [k in keyof TArgDefs]?: string;
        }
    ): this;
    run(runFn: ExtendedCommandRunFn<TArgDefs>): void;
    run(...inlineCommands: ExecCommand[]): void;
}

export type choice = {
    <V extends string = string>(
        values: V[],
        byDefault?: V
    ): ExtendedEnumArgDefinition<V>;
};
export type cmd = {
    (name: string): ExtendedCommandBuilder<{}>;
};
