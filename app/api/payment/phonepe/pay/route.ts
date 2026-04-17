import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, amount, userId, extra } = body;

    if (!transactionId || !amount) {
      return NextResponse.json(
        { success: false, message: "Transaction ID and amount are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // PhonePe Configuration from environment variables
    const merchantId = process.env.PHONEPE_MERCHANT_ID || "PGCHECKOUT"; // Default fallback
    const saltKey = process.env.PHONEPE_SALT_KEY || "your_phonepe_salt_key_here";
    const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";
    const env = process.env.PHONEPE_ENV || "sandbox"; // "sandbox" or "production"
    const callbackUrl = process.env.NEXT_PUBLIC_PHONEPE_CALLBACK_URL || "https://your-domain.com/api/payment/phonepe/callback";

    // Build the request payload
    const payload = {
      merchantId: merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: userId || "user_" + Math.floor(Math.random() * 1000000),
      amount: Math.round(amount * 100), // Convert to paise
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment-status?order_id=${transactionId}`,
      redirectMode: "REDIRECT",
      callbackUrl: callbackUrl,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    // Construct X-VERIFY checksum
    const payloadString = JSON.stringify(payload);
    const base64Payload = Buffer.from(payloadString).toString("base64");
    const endpoint = "/pg/v1/pay";
    const stringToHash = base64Payload + endpoint + saltKey;
    
    const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const xVerify = `${sha256}###${saltIndex}`;

    // PhonePe API URL based on environment
    const phonePeBaseUrl = env === "production" 
      ? "https://api.phonepe.com/apis/hermes" 
      : "https://api-preprod.phonepe.com/apis/pg-sandbox";

    console.log(`[PhonePe Pay] Environment: ${env}, Mode: REDIRECT`);
    console.log(`[PhonePe Pay] Requesting for Txn ID: ${transactionId}, Amount: ${amount}`);

    const phonePeResponse = await fetch(`${phonePeBaseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "accept": "application/json",
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const responseText = await phonePeResponse.text();
    let phonePeData;
    try {
      phonePeData = JSON.parse(responseText);
    } catch (e) {
      console.error("[PhonePe Pay] Failed to parse PhonePe response:", responseText);
      throw new Error("Invalid response from PhonePe");
    }

    if (phonePeData.success && phonePeData.data?.instrumentResponse?.redirectInfo?.url) {
      return NextResponse.json({
        success: true,
        redirectUrl: phonePeData.data.instrumentResponse.redirectInfo.url,
      }, { headers: corsHeaders });
    } else {
      console.error("[PhonePe Pay] Error response:", phonePeData);
      return NextResponse.json({
        success: false,
        message: phonePeData.message || "Failed to initiate payment with PhonePe",
      }, { status: 400, headers: corsHeaders });
    }

  } catch (error: any) {
    console.error("[PhonePe Pay] Server Error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
