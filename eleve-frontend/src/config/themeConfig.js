// src/config/themeConfig.js
export const modernTealTheme = {
  token: {
    colorPrimary: '#13c2c2', // Vibrant Cyan/Teal
    colorSuccess: '#36cfc9',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#13c2c2',
    colorBgContainer: '#1e293b', // slate-800
    colorBgLayout: '#0f172a', // slate-900
    colorText: '#f1f5f9', // slate-100
    colorTextSecondary: '#94a3b8', // slate-400
    colorBorder: '#334155', // slate-700
    borderRadius: 8,
    fontSize: 14,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
    boxShadowSecondary: '0 2px 8px rgba(0, 0, 0, 0.3)',
  },
  components: {
    Layout: {
      headerBg: '#1e293b',
      bodyBg: '#0f172a',
      siderBg: '#1e293b',
    },
    Card: {
      borderRadiusLG: 12,
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
      colorBorder: '#334155',
    },
    Table: {
      headerBg: '#0f172a',
      colorBgContainer: '#1e293b',
      borderColor: '#334155',
    },
    Button: {
      borderRadius: 8,
      colorPrimaryHover: '#36cfc9',
      colorPrimaryActive: '#08979c',
    },
    Input: {
      borderRadius: 8,
      colorBgContainer: '#0f172a',
      colorBorder: '#334155',
      hoverBorderColor: '#13c2c2',
      activeBorderColor: '#13c2c2',
    },
    Menu: {
      itemHoverBg: 'rgba(19, 194, 194, 0.1)',
      itemSelectedBg: 'rgba(19, 194, 194, 0.2)',
      itemColor: '#cbd5e1',
      itemHoverColor: '#13c2c2',
      itemSelectedColor: '#13c2c2',
    },
  },
};