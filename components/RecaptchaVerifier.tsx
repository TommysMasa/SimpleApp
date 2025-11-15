// components/RecaptchaVerifier.tsx
// Standard Firebase RecaptchaVerifier implementation using WebView
import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Modal, StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import type { ApplicationVerifier } from 'firebase/auth';
import { firebaseConfig } from '../firebaseConfig';

interface RecaptchaVerifierModalProps {
  firebaseConfig: any;
  attemptInvisibleVerification?: boolean;
}

export interface RecaptchaVerifierModalRef extends ApplicationVerifier {
  verify: () => Promise<string>;
  clear?: () => void;
  _reset?: () => void;
}

// Standard HTML template for Firebase RecaptchaVerifier (reCAPTCHA v2)
const getRecaptchaHTML = (firebaseConfig: any, attemptInvisible: boolean) => {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body, html {
        margin: 0;
        padding: 0;
        height: 100%;
        background-color: ${attemptInvisible ? 'transparent' : '#f9f9f9'};
      }
      #recaptcha-container {
        ${attemptInvisible ? 'display: none;' : 'display: flex; justify-content: center; align-items: center; height: 100%;'}
      }
    </style>
    <script src="https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.13.2/firebase-auth-compat.js"></script>
  </head>
  <body>
    <div id="recaptcha-container"></div>
    <script>
      (function() {
        const firebaseConfig = ${JSON.stringify(firebaseConfig)};
        
        // Initialize Firebase
        if (!firebase.apps || firebase.apps.length === 0) {
          firebase.initializeApp(firebaseConfig);
        }
        
        const auth = firebase.auth();
        const containerId = 'recaptcha-container';
        let recaptchaVerifier = null;
        let isReady = false;
        let verifyPromiseResolver = null;
        let verifyPromiseRejector = null;
        
        // Initialize reCAPTCHA using Firebase's standard RecaptchaVerifier
        function initRecaptcha() {
          if (recaptchaVerifier) {
            return;
          }
          
          try {
            // Verify Firebase is initialized
            if (!firebase.apps || firebase.apps.length === 0) {
              throw new Error('Firebase not initialized');
            }
            
            // Verify auth instance
            if (!auth) {
              throw new Error('Firebase Auth not initialized');
            }
            
            // Log Firebase config for debugging
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'debug',
                message: 'Initializing Firebase RecaptchaVerifier',
                authDomain: firebaseConfig.authDomain,
                projectId: firebaseConfig.projectId
              }));
            }
            
            // Create Firebase RecaptchaVerifier (standard reCAPTCHA v2)
            recaptchaVerifier = new firebase.auth.RecaptchaVerifier(containerId, {
              size: ${attemptInvisible ? "'invisible'" : "'normal'"},
              callback: function(response) {
                // reCAPTCHA solved
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'success',
                    token: response
                  }));
                }
                if (verifyPromiseResolver) {
                  verifyPromiseResolver(response);
                  verifyPromiseResolver = null;
                  verifyPromiseRejector = null;
                }
              },
              'expired-callback': function() {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'expired'
                  }));
                }
                if (verifyPromiseRejector) {
                  verifyPromiseRejector(new Error('reCAPTCHA expired'));
                  verifyPromiseResolver = null;
                  verifyPromiseRejector = null;
                }
              },
              'error-callback': function(error) {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'error',
                    error: error.message || 'reCAPTCHA error',
                    code: error.code || 'recaptcha-error',
                    stack: error.stack || ''
                  }));
                }
                if (verifyPromiseRejector) {
                  verifyPromiseRejector(error);
                  verifyPromiseResolver = null;
                  verifyPromiseRejector = null;
                }
              }
            }, auth);
            
            // Render reCAPTCHA
            recaptchaVerifier.render().then(function(widgetId) {
              isReady = true;
              // Expose recaptchaVerifier globally after render
              window.recaptchaVerifier = recaptchaVerifier;
              
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'ready'
                }));
              }
              
              // Auto-verify if invisible
              if (${attemptInvisible}) {
                recaptchaVerifier.verify();
              }
            }).catch(function(error) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'error',
                  error: error.message || 'Failed to render reCAPTCHA',
                  code: error.code || 'render-error',
                  stack: error.stack || ''
                }));
              }
            });
          } catch (error) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                error: error.message || 'Failed to initialize reCAPTCHA',
                code: error.code || 'init-error',
                stack: error.stack || ''
              }));
            }
          }
        }
        
        // Expose verify function to React Native
        window.verifyRecaptcha = function() {
          if (!recaptchaVerifier || !isReady) {
            return Promise.reject(new Error('reCAPTCHA not ready'));
          }
          
          return new Promise(function(resolve, reject) {
            verifyPromiseResolver = resolve;
            verifyPromiseRejector = reject;
            
            recaptchaVerifier.verify().then(function(token) {
              if (verifyPromiseResolver) {
                verifyPromiseResolver(token);
                verifyPromiseResolver = null;
                verifyPromiseRejector = null;
              }
            }).catch(function(error) {
              if (verifyPromiseRejector) {
                verifyPromiseRejector(error);
                verifyPromiseResolver = null;
                verifyPromiseRejector = null;
              }
            });
          });
        };
        
        // Initialize when page loads
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initRecaptcha);
        } else {
          initRecaptcha();
        }
      })();
    </script>
  </body>
</html>`;
};

export const FirebaseRecaptchaVerifierModal = forwardRef<
  RecaptchaVerifierModalRef,
  RecaptchaVerifierModalProps
>(({ firebaseConfig: config, attemptInvisibleVerification = false }, ref) => {
  const webViewRef = useRef<WebView>(null);
  const [visible, setVisible] = React.useState(false);
  const [isWebViewReady, setIsWebViewReady] = React.useState(false);
  const verifyPromiseRef = useRef<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  } | null>(null);
  const pendingVerifyRef = useRef<boolean>(false);

  const firebaseConfigForWebView = config || firebaseConfig;

  useImperativeHandle(ref, () => ({
    type: 'recaptcha',
    verify: async (): Promise<string> => {
      return new Promise((resolve, reject) => {
        verifyPromiseRef.current = { resolve, reject };
        
        if (!attemptInvisibleVerification) {
          setVisible(true);
          if (!isWebViewReady) {
            pendingVerifyRef.current = true;
            return;
          }
        }
        
        setTimeout(() => {
          triggerVerification();
        }, 100);
      });
    },
    clear: () => {
      // Clear reCAPTCHA (standard Firebase method)
      if (webViewRef.current) {
        const script = `
          if (window.recaptchaVerifier && window.recaptchaVerifier.clear) {
            window.recaptchaVerifier.clear();
          }
        `;
        webViewRef.current.injectJavaScript(script);
      }
    },
    _reset: () => {
      // Reset reCAPTCHA (internal Firebase method)
      if (webViewRef.current) {
        const script = `
          if (window.recaptchaVerifier) {
            if (window.recaptchaVerifier._reset) {
              window.recaptchaVerifier._reset();
            } else if (window.recaptchaVerifier.clear) {
              window.recaptchaVerifier.clear();
            }
          }
        `;
        webViewRef.current.injectJavaScript(script);
      }
    },
  }));

  const triggerVerification = () => {
    if (!webViewRef.current) {
      if (verifyPromiseRef.current) {
        verifyPromiseRef.current.reject(new Error('WebView ref is null'));
        verifyPromiseRef.current = null;
      }
      return;
    }
    
    const script = `
      if (window.verifyRecaptcha) {
        window.verifyRecaptcha().then(function(token) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'verify-success', token }));
        }).catch(function(error) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ 
            type: 'verify-error', 
            error: error.message || 'Unknown error',
            code: error.code || 'unknown',
            stack: error.stack || ''
          }));
        });
      } else {
        window.ReactNativeWebView.postMessage(JSON.stringify({ 
          type: 'verify-error', 
          error: 'reCAPTCHA not ready',
          code: 'recaptcha-not-ready'
        }));
      }
    `;
    
    webViewRef.current.injectJavaScript(script);
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data || '{}');
      
      // Debug messages
      if (data.type === 'debug') {
        console.log('[RecaptchaVerifier] Debug:', data.message, data);
        return;
      }
      
      if (data.type === 'ready') {
        setIsWebViewReady(true);
        if (pendingVerifyRef.current && verifyPromiseRef.current) {
          pendingVerifyRef.current = false;
          triggerVerification();
        }
        return;
      }
      
      if (data.type === 'success' || data.type === 'verify-success') {
        const token = data.token;
        if (verifyPromiseRef.current) {
          verifyPromiseRef.current.resolve(token);
          verifyPromiseRef.current = null;
        }
        if (!attemptInvisibleVerification) {
          setVisible(false);
        }
        return;
      }

      if (data.type === 'verify-error' || data.type === 'error') {
        const errorMessage = data.error || 'reCAPTCHA error';
        const errorCode = data.code || 'unknown';
        const errorStack = data.stack || '';
        
        console.error('[RecaptchaVerifier] Error details:', {
          message: errorMessage,
          code: errorCode,
          stack: errorStack,
          fullData: data
        });
        
        const error = new Error(errorMessage);
        (error as any).code = errorCode;
        (error as any).stack = errorStack;
        
        if (verifyPromiseRef.current) {
          verifyPromiseRef.current.reject(error);
          verifyPromiseRef.current = null;
        }
        if (!attemptInvisibleVerification) {
          setVisible(false);
        }
        return;
      }

      if (data.type === 'expired') {
        const error = new Error('reCAPTCHA expired. Please try again.');
        if (verifyPromiseRef.current) {
          verifyPromiseRef.current.reject(error);
          verifyPromiseRef.current = null;
        }
        if (!attemptInvisibleVerification) {
          setVisible(false);
        }
        return;
      }
    } catch (error) {
      console.error('[RecaptchaVerifier] Failed to parse message:', error);
      if (verifyPromiseRef.current) {
        verifyPromiseRef.current.reject(new Error('Unexpected reCAPTCHA response.'));
        verifyPromiseRef.current = null;
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (verifyPromiseRef.current) {
          verifyPromiseRef.current.reject(new Error('reCAPTCHA was cancelled.'));
          verifyPromiseRef.current = null;
        }
        setVisible(false);
      }}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          {!attemptInvisibleVerification && (
            <Text style={styles.title}>Verify you are human</Text>
          )}
          <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="always"
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            onMessage={handleMessage}
            source={{ html: getRecaptchaHTML(firebaseConfigForWebView, attemptInvisibleVerification) }}
            style={styles.webview}
          />
        </View>
      </View>
    </Modal>
  );
});

FirebaseRecaptchaVerifierModal.displayName = 'FirebaseRecaptchaVerifierModal';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },
  webview: {
    width: 320,
    height: 430,
    backgroundColor: 'transparent',
    alignSelf: 'stretch',
  },
});
