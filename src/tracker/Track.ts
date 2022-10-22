import {CWCO} from "../cwco";
import {TrackType} from "../enums/track-type";
import {convertHtmlEntities} from "../utils/convert-html-entities";

export class Track {
	public executables: CWCO.Executable[] = [];
	public handler: CWCO.DirectiveConstructor | null = null;
	public prop: string | null = null;
	public prevValue: any = null;

	constructor(
		public name: string,
		public value: string,
		public type: TrackType = TrackType.attribute
	) {
	}
}