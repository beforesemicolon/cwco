import {If} from './if.directive';
import {Ref} from './ref.directive';
import {Attr} from './attr.directive';
import {Repeat} from './repeat.directive';
import {Bind} from "./bind.directive";

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
