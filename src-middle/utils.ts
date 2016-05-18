import path from 'path';

export const appRoot = path.resolve(); // フロントエンドとサーバーサイドの両方でルートパスを取得する。
console.log('Application Root: ' + appRoot);