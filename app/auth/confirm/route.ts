import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") || "/overview";

  // Check if we have the required parameters
  if (!token_hash || !type) {
    console.error("Missing token_hash or type in confirmation URL");
    return NextResponse.redirect(`${requestUrl.origin}/login?error=invalid_link`);
  }

  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    // Verify the token hash
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (error) {
      console.error("Error verifying OTP:", error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=verification_failed`);
    }

    // Get the user to ensure they're authenticated
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error getting user after verification:", userError);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=user_not_found`);
    }

    console.log("User successfully authenticated:", user.user?.email);

    // Redirect to the overview page or specified next URL
    return NextResponse.redirect(new URL(next, req.url));
  } catch (error) {
    console.error("Unexpected error during confirmation:", error);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=unexpected_error`);
  }
} 