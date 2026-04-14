import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Create user
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email: "ali@am.com",
    password: "ali123",
    email_confirm: true,
    user_metadata: { full_name: "Ali Admin" },
  });

  if (userError && !userError.message.includes("already been registered")) {
    return new Response(JSON.stringify({ error: userError.message }), { status: 400 });
  }

  // Get user id
  let userId = userData?.user?.id;
  if (!userId) {
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const found = users?.users?.find((u: any) => u.email === "ali@am.com");
    userId = found?.id;
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  // Assign admin role
  const { error: roleError } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

  return new Response(
    JSON.stringify({ success: true, userId, roleError: roleError?.message }),
    { headers: { "Content-Type": "application/json" } }
  );
});
