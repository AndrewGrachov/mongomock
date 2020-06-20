import {Cursor} from './Cursor';

export class Collection<T extends object> {
	private items: T[];
	constructor(data: T[]) {
		this.items = {...data};
	}
	private restore() {}
	public find(query: Record<string, any>): Cursor<T> {}
}
