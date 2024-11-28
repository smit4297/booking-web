/** @type {import('next/dist/next-server/server/config-shared').NextConfig} */
// const nextConfig = {
//   webpack: (config : any, { isServer  } : any) => {
//     if (!isServer) {
//       config.resolve.fallback = {
//         ...config.resolve.fallback,
//         net: false,
//         dns: false,
//         tls: false,
//         fs: false,
//         request: false,
//         child_process: false,
//         assert: require.resolve('assert/'),
//         http: require.resolve('stream-http'),
//         https: require.resolve('https-browserify'),
//         os: require.resolve('os-browserify/browser'),
//         stream: require.resolve('stream-browserify'),
//         url: require.resolve('url/'),
//         util: require.resolve('util/'),
//         buffer: require.resolve('buffer/'),
//         zlib: require.resolve('browserify-zlib'),
//         path: require.resolve('path-browserify'),
//       };
//     }
//     return config;
//   }
// }

const nextConfig = {
  typescript: {
    // Skip type checking during build
    ignoreBuildErrors: true,
  },
};
export default nextConfig;

