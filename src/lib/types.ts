import { WebComponentInstance } from './config';
import { ModuleBase } from './module';

type _Remove<
    A extends {
        [key: string]: any;
    },
    B
> = {
    [K in keyof A]: A[K] extends B ? never : K;
}[keyof A];

type RemoveType<
    A extends {
        [key: string]: any;
    },
    B
> = {
    [K in _Remove<A, B>]: A[K];
};
type GetParam<C extends ModuleBase> = C['__wclib_render_params'];
type HasParams<C extends WebComponentInstance> = {
    [K in keyof C]: C[K] extends ModuleBase
        ? C[K] extends {
              __wclib_render_params: undefined;
          }
            ? false
            : true
        : false;
};
export type GetParams<C extends WebComponentInstance> = {
    [K in keyof RemoveType<HasParams<C>, false>]: GetParam<C[K]>;
};
