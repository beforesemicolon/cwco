import {CWCO} from "../cwco";
import Executable = CWCO.Executable;
import DirectiveConstructor = CWCO.DirectiveConstructor;
import {TrackType} from "../enums/track-type";

export class Track {
	public executables: Executable[] = [];
	public handler: DirectiveConstructor | null = null;
	public prop: string | null = null;
	public prevValue: any = null;

	constructor(
		public name: string,
		public value: string,
		public type: TrackType = TrackType.attribute
	) {
	}
}