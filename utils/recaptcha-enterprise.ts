// utils/recaptcha-enterprise.ts
// reCAPTCHA Enterprise API を手動で呼び出すためのユーティリティ
// 注意: 通常、Firebase Phone AuthenticationではFirebaseが自動的にreCAPTCHAを処理するため、
// このユーティリティはデバッグ目的やカスタム検証が必要な場合のみ使用してください。

interface RecaptchaAssessmentRequest {
  event: {
    token: string;
    expectedAction?: string;
    siteKey: string;
  };
}

interface RecaptchaAssessmentResponse {
  tokenProperties: {
    valid: boolean;
    invalidReason?: string;
    hostname?: string;
    action?: string;
    createTime?: string;
  };
  riskAnalysis: {
    score: number;
    reasons?: string[];
  };
  event: {
    token?: string;
    siteKey?: string;
    userAgent?: string;
    userIpAddress?: string;
    expectedAction?: string;
  };
  name?: string;
}

/**
 * reCAPTCHA Enterprise APIを使用してトークンを検証します
 * 
 * @param token - grecaptcha.enterprise.execute() から返されたトークン
 * @param siteKey - reCAPTCHAサイトキー（例: "6Le8KA0sAAAAAJx-7m6uzI0LEkrExnWT5xmz62ZU"）
 * @param expectedAction - ユーザー開始アクション（オプション）
 * @param apiKey - Google Cloud APIキー（環境変数から取得）
 * @returns 検証結果
 */
export async function verifyRecaptchaEnterprise(
  token: string,
  siteKey: string,
  expectedAction?: string,
  apiKey?: string
): Promise<RecaptchaAssessmentResponse> {
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'simpleapp-5c1c6';
  const apiKeyToUse = apiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

  if (!apiKeyToUse) {
    throw new Error('API key is required. Set EXPO_PUBLIC_FIREBASE_API_KEY in your environment variables.');
  }

  const requestBody: RecaptchaAssessmentRequest = {
    event: {
      token,
      siteKey,
      ...(expectedAction && { expectedAction }),
    },
  };

  const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKeyToUse}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `reCAPTCHA Enterprise API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
      );
    }

    const data: RecaptchaAssessmentResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('[RecaptchaEnterprise] Verification error:', error);
    throw error;
  }
}

/**
 * リクエスト本文をJSONファイルとして保存します（デバッグ用）
 * 
 * @param token - reCAPTCHAトークン
 * @param siteKey - reCAPTCHAサイトキー
 * @param expectedAction - ユーザー開始アクション（オプション）
 * @param filename - 保存するファイル名（デフォルト: "request.json"）
 */
export function saveRequestJson(
  token: string,
  siteKey: string,
  expectedAction?: string,
  filename: string = 'request.json'
): void {
  const requestBody: RecaptchaAssessmentRequest = {
    event: {
      token,
      siteKey,
      ...(expectedAction && { expectedAction }),
    },
  };

  // ブラウザ環境でのみ動作（Node.js環境では使用しない）
  if (typeof window !== 'undefined') {
    const blob = new Blob([JSON.stringify(requestBody, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    console.log('Request JSON (for Node.js):', JSON.stringify(requestBody, null, 2));
  }
}

