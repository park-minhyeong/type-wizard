# Type Wizzard

A powerful and flexible TypeScript runtime type validation library with detailed error messages.

## Installation

```bash
npm install type-wizard
```

## Features

- Runtime type validation for TypeScript types
- Detailed error messages
- Support for nested objects and arrays
- Optional and nullable fields
- Enum validation
- Date validation
- Custom validation functions

## Usage

### Basic Example

```typescript
import { createTypeGuard } from 'type-wizard';

// Define your type
interface UserData {
  name?: string;
  age: number;
  email: string;
  birthDate: Date;
  tags: string[];
  settings: {
    notifications: boolean;
    theme: 'light' | 'dark';
  }
}

// Create a type guard
const isUserData = createTypeGuard<UserData>({
  name: { type: 'string', optional: true },
  age: { type: 'number' },
  email: { type: 'string' },
  birthDate: { type: 'date' },
  tags: { type: 'array', of: { type: 'string' } },
  settings: {
    type: 'object',
    of: {
      notifications: { type: 'boolean' },
      theme: { type: 'string', enum: ['light', 'dark'] }
    }
  }
});

// Use it for validation
if (isUserData(data)) {
  // data is now typed as UserData
  console.log('Valid user data:', data);
} else {
  // Get detailed error message if validation fails
  console.error('Invalid user data:', isUserData.message(data));
}
```

### Type Descriptors

The library supports the following type descriptors:

- `string`: Validates string values
  ```typescript
  { type: 'string', optional?: boolean, nullable?: boolean, enum?: readonly unknown[] }
  ```

- `number`: Validates number values
  ```typescript
  { type: 'number', optional?: boolean, nullable?: boolean, enum?: readonly unknown[] }
  ```

- `boolean`: Validates boolean values
  ```typescript
  { type: 'boolean', optional?: boolean, nullable?: boolean }
  ```

- `date`: Validates Date objects and date strings
  ```typescript
  { type: 'date', optional?: boolean, nullable?: boolean }
  ```

- `object`: Validates object structures
  ```typescript
  { type: 'object', optional?: boolean, nullable?: boolean, of: Schema | ((v: unknown) => boolean) }
  ```

- `array`: Validates arrays
  ```typescript
  { type: 'array', optional?: boolean, nullable?: boolean, of: TypeDescriptor | ((v: unknown) => boolean) }
  ```

### Additional Features

#### Optional Fields
Mark fields as optional using the `optional` property:
```typescript
const guard = createTypeGuard<PartialUser>({
  name: { type: 'string', optional: true }
});
```

#### Nullable Fields
Allow null values using the `nullable` property:
```typescript
const guard = createTypeGuard<UserWithNullable>({
  email: { type: 'string', nullable: true }
});
```

#### Enum Validation
Restrict values to a specific set using the `enum` property:
```typescript
const guard = createTypeGuard<UserPreferences>({
  theme: { type: 'string', enum: ['light', 'dark'] }
});
```

#### Custom Validation
Use custom validation functions for complex cases:
```typescript
const guard = createTypeGuard<CustomType>({
  value: { type: 'object', of: (v) => customValidationFunction(v) }
});
```

## Error Messages

The library provides detailed error messages through the `message` method:

```typescript
const data = { /* ... */ };
if (!isUserData(data)) {
  console.error(isUserData.message(data));
  // Example outputs:
  // "name: expected string, got number"
  // "age: missing required property"
  // "settings.theme: value 'blue' is not allowed (allowed: light, dark)"
}
```

## License

MIT

## Author

Minhyeong Park
