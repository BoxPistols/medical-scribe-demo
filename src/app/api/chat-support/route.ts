import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { SoapNote, ModelId } from '../analyze/types';
import { AVAILABLE_MODELS, DEFAULT_MODEL } from '../analyze/types';

// チャットサポート用システムプロンプト
const CHAT_SUPPORT_PROMPT = `あなたは医療従事者向けの診療支援AIアシスタントです。医師や看護師が診療を行う際のサポートを行います。

## あなたの役割
1. **診療サポート**: 問診データに基づいて、診断の確認、追加検査の提案、フォローアップの推奨を行います
2. **誤診防止支援**: 鑑別診断の確認、レッドフラグ症状のチェック、見落としがちなポイントの指摘を行います
3. **アプリ使用サポート**: このアプリ（Medical Voice Scribe）の使い方について説明します

## 応答ルール
- 日本語で応答してください
- 簡潔で実用的な回答を心がけてください
- 医学的な提案は、あくまで参考情報として提示し、最終判断は医療従事者に委ねてください
- 患者に直接説明する内容ではなく、医療従事者向けの専門的な内容で回答してください
- 不確かな情報は推測であることを明示してください

## アプリの使い方に関する質問への回答
このアプリ「Medical Voice Scribe」は医療音声文字起こし＆カルテ生成アプリです：
- **録音機能**: 「録音開始」ボタンまたはRキーで開始、再度押すと停止
- **カルテ生成**: 「カルテ生成」ボタンまたはAキーで、入力テキストからSOAP形式のカルテを自動生成
- **エクスポート**: JSON/CSV形式でカルテをダウンロード可能
- **インポート**: 以前エクスポートしたJSONファイルを読み込み可能
- **読み上げ**: 各セクションのスピーカーアイコンで音声読み上げ
- **テーマ**: ライト/ダーク/システム設定から選択可能
- **ショートカット**: ?キーでヘルプ、各種ショートカットはカスタマイズ可能

## 診療サポートの際の注意点
- 提供された問診データ（SOAP形式）を参照しながら回答
- 診断名だけでなく、その根拠や確認すべきポイントも説明
- 鑑別診断を挙げる際は、除外すべき理由や追加検査も提案
- 緊急性の高い症状や所見がある場合は、明確に警告
`;

// モデルIDの検証
function isValidModel(model: string): model is ModelId {
  return AVAILABLE_MODELS.some(m => m.id === model);
}

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY環境変数が設定されていません');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// SOAPノートをコンテキスト文字列に変換
function formatSoapContext(soapNote: SoapNote | null): string {
  if (!soapNote) return '（カルテデータなし）';

  const { soap, summary, patientInfo } = soapNote;

  return `
## 現在の診療データ

### 要約
${summary}

### 患者情報
- 主訴: ${patientInfo.chiefComplaint}
- 症状期間: ${patientInfo.duration}

### S（主観的情報）
- 現病歴: ${soap.subjective.presentIllness}
- 症状: ${soap.subjective.symptoms.join(', ')}
- 重症度: ${soap.subjective.severity}
- 発症時期: ${soap.subjective.onset}
- 随伴症状: ${soap.subjective.associatedSymptoms.join(', ')}
- 既往歴: ${soap.subjective.pastMedicalHistory}
- 服用中の薬: ${soap.subjective.medications.join(', ') || 'なし'}

### O（客観的情報）
- バイタル: BP ${soap.objective.vitalSigns.bloodPressure}, P ${soap.objective.vitalSigns.pulse}, T ${soap.objective.vitalSigns.temperature}, RR ${soap.objective.vitalSigns.respiratoryRate}
- 身体所見: ${soap.objective.physicalExam}
- 検査所見: ${soap.objective.laboratoryFindings}

### A（評価）
- 診断: ${soap.assessment.diagnosis}
- ICD-10: ${soap.assessment.icd10}
- 鑑別診断: ${soap.assessment.differentialDiagnosis.join(', ')}
- 臨床的印象: ${soap.assessment.clinicalImpression}

### P（計画）
- 治療方針: ${soap.plan.treatment}
- 処方薬: ${soap.plan.medications.map(m => `${m.name} ${m.dosage} ${m.frequency}`).join(', ')}
- 検査計画: ${soap.plan.tests.join(', ')}
- 紹介: ${soap.plan.referral}
- フォローアップ: ${soap.plan.followUp}
- 患者教育: ${soap.plan.patientEducation}
`;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: Request) {
  try {
    const { message, soapNote, transcript, model: requestedModel, conversationHistory } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'メッセージがありません' },
        { status: 400 }
      );
    }

    // モデルの検証とフォールバック
    const model = requestedModel && isValidModel(requestedModel) ? requestedModel : DEFAULT_MODEL;

    const openai = getOpenAIClient();

    // コンテキストの構築
    const soapContext = formatSoapContext(soapNote);
    const transcriptContext = transcript ? `\n## 元のトランスクリプト\n${transcript.slice(0, 2000)}` : '';

    // 会話履歴の構築
    const historyMessages: OpenAI.Chat.ChatCompletionMessageParam[] = (conversationHistory || [])
      .slice(-10)
      .map((msg: ChatMessage) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: CHAT_SUPPORT_PROMPT + '\n\n' + soapContext + transcriptContext
        },
        ...historyMessages,
        { role: "user", content: message },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      return NextResponse.json(
        { error: 'AI応答が空です' },
        { status: 500 }
      );
    }

    // 応答タイプの判定（警告、推奨、通常）
    let responseType = 'normal';
    if (content.includes('警告') || content.includes('注意') || content.includes('緊急')) {
      responseType = 'warning';
    } else if (content.includes('推奨') || content.includes('提案') || content.includes('検討')) {
      responseType = 'recommendation';
    }

    return NextResponse.json({
      response: content,
      type: responseType,
    });

  } catch (error) {
    console.error('Chat Support API Error:', error);

    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'OpenAI APIキーが無効です' },
          { status: 500 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'APIレート制限に達しました。しばらく待ってから再試行してください' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `OpenAI APIエラー: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'チャット処理に失敗しました' },
      { status: 500 }
    );
  }
}
