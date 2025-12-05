import { WebView } from 'react-native-webview';

const EnkaNetworkScreen = () => {
  return (
    <WebView 
      source={{ uri: 'https://enka.network/' }}
      style={{ flex: 1 }}
    />
  );
};