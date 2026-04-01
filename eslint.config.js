import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsp from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsp,
      sourceType: 'module',
    },
    
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      // ✅ Lỗi console.log
      // 'no-console': 'warn',
      'no-console': 'off', // Tắt lỗi console.log

      // ✅ Format code
      'indent': ['warn', 2], // Indent 2 spaces
      'semi': ['warn', 'never'], // Không dùng dấu ; cuối dòng
      'quotes': ['error', 'single'], // Dùng nháy đơn
      'comma-dangle': ['warn', 'always-multiline'], // Dấu phẩy cuối dòng với object/array
      'array-bracket-spacing': ['warn', 'never'], // Không có khoảng trắng trong []
      'object-curly-spacing': ['warn', 'always'], // Có khoảng trắng trong {}
      'space-before-blocks': ['error', 'always'], // Dấu cách trước dấu { mở block
      'keyword-spacing': 'warn', // Dấu cách giữa từ khóa (if, else, return,...)
      'arrow-spacing': 'warn', // Dấu cách giữa => trong arrow function
      'no-multi-spaces': 'warn', // Không dùng nhiều khoảng trắng liên tiếp
      'no-unused-vars': 'off', // Tắt lỗi biến không sử dụng (đã có @typescript-eslint/no-unused-vars)

      // ✅ Quy tắc TypeScript
      '@typescript-eslint/no-unused-vars': 'off',
      // '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }], // Bỏ qua biến có tiền tố _
      '@typescript-eslint/no-explicit-any': 'warn', // Cảnh báo khi dùng any
      '@typescript-eslint/consistent-type-imports': 'warn', // Dùng import type khi cần
      '@typescript-eslint/explicit-function-return-type': 'off', // Không bắt buộc khai báo kiểu trả về
    }
  }
]