import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
const { resolve } = require('path')
import autoComponents from 'unplugin-vue-components/vite'
import legacy from '@vitejs/plugin-legacy'
import VueSetupExtend from 'vite-plugin-vue-setup-extend'
import AutoImport from 'unplugin-auto-import/vite'
import viteImagemin from "vite-plugin-imagemin"
import purgeIcons from 'vite-plugin-purge-icons'

function pathResolve(dir) {
  return resolve(__dirname, dir);
}


export default defineConfig(({
  mode,
  command
}) => ({
  base: loadEnv(mode, process.cwd()).VITE_PUBLIC,
  resolve: {
    alias: {
      '@': pathResolve('src'),
      '@components': pathResolve('src/components'),
      '@images': pathResolve('src/assets/images'),
    },
  },
  //跨域設定
  server: {
    host: 'localhost',
    port: 3000,
    open: false,
    https: false,
    proxy: {
      '/api': {
        target: 'http://jsonplaceholder.typicode.com', //代理接口
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  },
  build: {
    //構建後體積更小
    minify: "terser",
    //靜態資源導出路徑
    assetsDir: 'img/',
    // 確保外部化處理那些你不想打包進庫的依賴
    external: ['vue'],
    // 取消計算文件大小，加快打包速度
    reportCompressedSize: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      //依不同類型檔案拆分資料夾
      output: {
        //NOTE: 全散在外面
        // chunkFileNames: 'js/[name]-[hash].js',
        // entryFileNames: 'js/[name]-[hash].js',
        // assetFileNames: '[ext]/[name]-[hash].[ext]',

        //NOTE: 把js跟css包一起
        assetFileNames: (assetInfo) => {
          var info = assetInfo.name.split(".");
          var extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = "img";
          } else if (/woff|woff2/.test(extType)) {
            extType = "css";
          }
          console.log(assetInfo.name)
          return `static/${extType}/[name]-[hash][extname]`;
        },
        chunkFileNames: "static/js/[name]-[hash].js",
        entryFileNames: "static/js/[name]-[hash].js",
        globals: {
          vue: 'Vue',
        },
        //依賴包過於龐大時進行拆分
        manualChunks(id) {
          if(id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      },
    },
  },
  //prod模式去除console
  terserOptions: {
    compress: {
      drop_console: command !== 'serve',
      drop_debugger: command !== 'serve'
    }
  },
  //全局都可以引用
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        @import "@/assets/scss/_mixin.scss";
        @import "@/assets/scss/_palette.scss";
        @import "@/assets/scss/_extend.scss";
      `
      }
    }
  },
  // 引入第三方的配置
  optimizeDeps: {
    include: ["axios"]
  },
  plugins: [
    vue(),
    autoComponents({
      dirs: [
        'src/components',
        'src/layout'
      ],
      resolvers: [],
      dts: true
    }),
    //CI/CD自動部屬會噴錯 記得要拿掉
    viteImagemin(),
    VueSetupExtend(),
    AutoImport({
      // API 自动导入
      dts: 'src/auto-imports.d.ts',
      imports: [
        'vue',
        'vue-router',
        'pinia'
      ],
      // 解决eslint報錯問題
      eslintrc: {
        enabled: true
      }
    }),
    //提供傳統瀏覽器兼容
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    purgeIcons(),
  ],
  envDir: pathResolve('./src/env'),
}))