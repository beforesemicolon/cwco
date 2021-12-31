import {If} from './if.directive';
import {Ref} from './ref.directive';
import {Attr} from './attr.directive';
import {Repeat} from './repeat.directive';

If.register('if');
Ref.register('ref');
Attr.register('attr');
Repeat.register('repeat');

export const directives = new Set([
	If.name.toLowerCase(),
	Ref.name.toLowerCase(),
	Attr.name.toLowerCase(),
	Repeat.name.toLowerCase(),
])
