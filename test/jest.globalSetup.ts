import execa from 'execa'

export default async () => {
  const { stdout, stderr } = await execa('npx', ['prisma', 'generate'], {
    cwd: './fixtures/basic'
  })

  console.log(stdout)
}
