        // vuonght/metro.config.js
        const { getDefaultConfig } = require('expo/metro-config');

        /** @type {import('expo/metro-config').MetroConfig} */
        const defaultConfig = getDefaultConfig(__dirname);

        // Thêm 'cjs' vào sourceExts nếu chưa có
        if (defaultConfig.resolver.sourceExts && !defaultConfig.resolver.sourceExts.includes('cjs')) {
          defaultConfig.resolver.sourceExts.push('cjs');
        }

        // DÒNG QUAN TRỌNG ĐÃ GIÚP SỬA LỖI TRONG DỰ ÁN TEST
        defaultConfig.resolver.unstable_enablePackageExports = false;

        module.exports = defaultConfig;
        