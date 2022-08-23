import {If} from './If.directive';
import {Ref} from './Ref.directive';
import {Attr} from './Attr.directive';
import {Repeat} from './Repeat.directive';
import {Bind} from "./Bind.directive";

If.register();
Ref.register();
Attr.register();
Repeat.register();
Bind.register();

export const directives = new Set([
	If.name.toLowerCase(),
	Ref.name.toLowerCase(),
	Attr.name.toLowerCase(),
	Repeat.name.toLowerCase(),
	Bind.name.toLowerCase(),
])
