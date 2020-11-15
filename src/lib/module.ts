import { WebComponentInstance } from './config';

export interface WCLibModule {
    __wclib_module: true;
}

export abstract class ModuleBase implements WCLibModule {
    constructor(private _self: WebComponentInstance) {}

    public __wclib_module = true as const;
    public abstract __wclib_render_params: unknown | undefined;
}
