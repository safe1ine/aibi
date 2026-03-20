import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: 'http://localhost:8100/openapi.json',
  output: 'src/api/generated',
  client: 'axios',
  plugins: [
    '@hey-api/sdk',
  ],
})
