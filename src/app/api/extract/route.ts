import { NextResponse } from 'next/server';
import { ExtractedReceiptData } from '../../../lib/types';
import { VALID_CATEGORIES } from '../../../lib/constants';

export async function POST(request: Request) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
    const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
    const AZURE_DEPLOYMENT_NAME = process.env.AZURE_DEPLOYMENT_NAME;

    if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_KEY || !AZURE_DEPLOYMENT_NAME) {
      return NextResponse.json({ error: 'Azure OpenAI configuration is missing' }, { status: 500 });
    }

    const validCategoriesText = VALID_CATEGORIES.join(', ');

    const payload = {
      model: AZURE_DEPLOYMENT_NAME,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `Extract the following information from this receipt: 
- merchant_name (string)
- receipt_date (ISO 8601 string format YYYY-MM-DD)
- total_amount (number)
- category (string)

IMPORTANT: The category MUST be strictly chosen from this list if possible: [${validCategoriesText}]. 
If you can reasonably classify the expense into one of those categories, use exactly that category name.

Return ONLY a valid JSON object with these exact keys.`
            },
            {
              type: 'input_image',
              image_url: `data:image/jpeg;base64,${imageBase64}`
            }
          ]
        }
      ]
    };

    const response = await fetch(AZURE_OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_OPENAI_KEY
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded (10,000 TPM limit). Please try again later.' }, { status: 429 });
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Azure OpenAI Error:', errorData);
      return NextResponse.json({ error: 'Failed to extract data from image' }, { status: response.status });
    }

    const result = await response.json();

    console.log('result ->', result);
    
    // Support both Chat Completions (choices) and Responses API (output)
    let extractedText = '{}';
    if (result?.choices?.[0]?.message?.content) {
      extractedText = result.choices[0].message.content;
    } else if (result?.output) {
      // Responses API: find the 'message' item (skip 'reasoning' items)
      const messageItem = result.output.find((item: any) => item.type === 'message');
      if (messageItem?.content) {
        const textPart = messageItem.content.find((p: any) => p.type === 'output_text');
        if (textPart) extractedText = textPart.text;
      }
    }

    console.log('extractedText ->', extractedText);

    const jsonString = extractedText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    let parsedData: ExtractedReceiptData;
    try {
      parsedData = JSON.parse(jsonString);
    } catch {
       return NextResponse.json({ error: 'Failed to parse AI response', rawText: extractedText }, { status: 500 });
    }

    console.log('parsedData ->', parsedData);

    return NextResponse.json({ data: parsedData });
  } catch (error: unknown) {
    console.error('Extraction error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
