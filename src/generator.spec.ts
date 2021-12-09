import execa from 'execa'
import stripAnsi from 'strip-ansi'

describe('generator', () => {
  it('should generate basic', async () => {
    const { stdout, stderr } = await execa('npx', ['prisma', 'generate'], {
      cwd: './fixtures/basic'
    })

    expect(stripAnsi(stdout)).toContain(
      'Generated Prisma Typegraphql Types Generator'
    )
    expect(stderr).toBe('')
    // @ts-expect-error
    expect('./fixtures/basic/models/generated').toMatchFilesystemSnapshot()
  })
})
