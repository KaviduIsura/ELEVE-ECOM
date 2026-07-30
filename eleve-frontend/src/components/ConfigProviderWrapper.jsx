// src/components/ConfigProviderWrapper.jsx
import React from 'react';
import { ConfigProvider, theme } from 'antd';
import { modernTealTheme } from '../config/themeConfig';

const ConfigProviderWrapper = ({ children }) => {
  return (
    <ConfigProvider theme={{ ...modernTealTheme, algorithm: theme.darkAlgorithm }}>
      {children}
    </ConfigProvider>
  );
};

export default ConfigProviderWrapper;