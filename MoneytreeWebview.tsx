import {useEffect, useRef} from 'react';
import {BackHandler} from 'react-native';
import {WebView} from 'react-native-webview';

const getMoneytreeOrigin = (mode: MoneytreeMode) => {
  return mode === MoneytreeMode.PROD
    ? 'http://10.20.131.30:3000'
    : 'http://10.20.131.30:3000';
};

export enum MoneytreeEventType {
  PAYMENT = 'payment',
}

export enum MoneytreeMode {
  TEST = 'test',
  PROD = 'prod',
}
export class MoneytreeEvent {
  type: MoneytreeEventType;
  data: any;

  constructor(type: MoneytreeEventType, data: any) {
    this.type = type;
    this.data = data;
  }
}

export const confirmPaymentEvent = (orderId: string) => {};

export function MoneytreeWebview({
  jwtToken,
  onInit,
  onEventReceived,
  mode = MoneytreeMode.PROD,
  onPressedBackInMain,
  onClose,
}: {
  jwtToken: string;
  onInit?: () => void;
  onEventReceived: (event: MoneytreeEvent) => void;
  mode?: MoneytreeMode;
  onPressedBackInMain?: () => void;
  onClose?: () => void;
}) {
  const webviewRef = useRef<WebView>(null);
  const origin = getMoneytreeOrigin(mode);

  useEffect(() => {
    if (webviewRef.current) {
      onInit?.();
    }
  }, []);
  console.log('jwtToken', jwtToken);

  useEffect(() => {
    const onBackPressed = () => {
      webviewRef.current?.injectJavaScript(`
                window.ReactNativeWebView.replacePathname();
                true;
                `);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPressed,
    );
    return () => backHandler.remove();
  }, []);

  const handleShouldStartLoadWithRequest = (request: any) => {
    if (request.url.startsWith(origin)) {
      return true;
    }
    return false;
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.event) {
        case 'login':
          webviewRef.current?.injectJavaScript(`
                            window.ReactNativeWebView.login(${JSON.stringify(
                              jwtToken,
                            )}, ${JSON.stringify('1.0.0')});
                            true;
                        `);
          break;
        case 'payment':
          const event = new MoneytreeEvent(MoneytreeEventType.PAYMENT, data);
          onEventReceived(event);
          break;
        case 'runOnPressedBackInMain':
          if (onPressedBackInMain !== null) {
            onPressedBackInMain?.();
          }
          break;
        case 'close':
          onClose?.();
          break;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <WebView
      source={{
        uri: `${origin}/commerce/raffles`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `hihihi`,
          'X-API-KEY': 'ef5a8f23-ebd4-47cb-a159-118bee406380',
        },
      }}
      ref={webviewRef}
      onMessage={handleMessage}
      javaScriptEnabled={true}
      userAgent="moneytree_webview"
      onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      style={{backgroundColor: 'transparent'}}
    />
  );
}
