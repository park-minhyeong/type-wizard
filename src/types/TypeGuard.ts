export interface Schema { [key: string]: TypeDescriptor }

export type TypeDescriptor =
	| { type: 'string'; optional?: boolean; nullable?: boolean; enum?: readonly unknown[] }
	| { type: 'number'; optional?: boolean; nullable?: boolean; enum?: readonly unknown[] }
	| { type: 'boolean'; optional?: boolean; nullable?: boolean; enum?: readonly unknown[] }
	| { type: 'date'; optional?: boolean; nullable?: boolean }
	| { type: 'object'; optional?: boolean; nullable?: boolean; of: Schema | ((v: unknown) => boolean) }
	| { type: 'array'; optional?: boolean; nullable?: boolean; of: TypeDescriptor | ((v: unknown) => boolean) };

export interface TypeGuard<T> {
	(value: unknown): value is T;
	optional(): TypeGuard<T | null>;
	message(val: unknown): string | null;
}