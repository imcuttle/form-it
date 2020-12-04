import { defineConfig } from 'dumi'

export default defineConfig({
  resolve: {
    // default to include src, lerna pkg's src & docs folder
    includes: ['demo']
  },
  hash: true,
  history: {
    type: 'hash'
  },
  mode: 'doc'
})
