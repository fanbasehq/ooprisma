import { toMatchFilesystemSnapshot } from 'jest-fs-snapshot'
// @ts-expect-error
expect.extend({ toMatchFilesystemSnapshot })
