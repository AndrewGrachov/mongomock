import {Collection} from './Collection';

export class MongoMock {
	private collections: Map<string, Collection<any>> = new Map();

	setCollection<T extends object>(collectionName: string, data: T[]) {
		this.collections.set(collectionName, new Collection<T>(data));
	}

	async collection<T extends object>(collectionName: string): Promise<Collection<T> | undefined> {
		const collection = this.collections.get(collectionName);
		if (typeof collection !== undefined) {
			return collection as Collection<T>;
		}
		return undefined;
	}
}
