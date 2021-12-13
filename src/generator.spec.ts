import execa from 'execa'
import stripAnsi from 'strip-ansi'

describe('generator', () => {
  it('should generate basic', async () => {
    // @ts-expect-error
    expect('./fixtures/basic/models/generated').toMatchFilesystemSnapshot()
  })

  it
})
