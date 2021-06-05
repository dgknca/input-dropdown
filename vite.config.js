const path = require('path')
import scss from 'rollup-plugin-scss'

module.exports = {
  server: {
    open: '/demo/index.html'
  },
  build: {
    watch: {
      include: ['src/**/*.ts', 'src/**/*.scss']
    },
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      name: 'InputDropdown'
    }
  },
  plugins: [
    scss({
      output: './dist/input-dropdown.min.css',
      outputStyle: 'compressed',
      failOnError: true
    })
  ]
}
