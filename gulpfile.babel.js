import path from 'path'
import vstarter from 'vstarter'

vstarter({
  dist:'./www/',

  alias: {
    'components': path.resolve(__dirname, './src/components'),
    'statics': path.resolve(__dirname, './src/statics')
  },

  port: '8082'
})
